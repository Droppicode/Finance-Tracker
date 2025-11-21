import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/api`; // Base path for Vercel functions
const COLLECTION_NAME = 'historical-data';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get document ID for a symbol (always use 'max' range)
 */
const getDocId = (symbol) => `${symbol}_max`;

/**
 * Check if cached data is still valid (less than 24 hours old)
 */
const isCacheValid = (fetchedAt) => {
    if (!fetchedAt) return false;

    const fetchedTime = new Date(fetchedAt).getTime();
    const now = Date.now();

    return (now - fetchedTime) < CACHE_DURATION_MS;
};

/**
 * Fetch historical data from Firestore (always fetches 'max' range)
 * 
 * @param {string} symbol - Stock symbol (e.g., 'PETR4')
 * @returns {Promise<Object|null>} Historical data or null if not found
 */
export const fetchHistoricalDataFromFirestore = async (symbol) => {
    try {
        const docId = getDocId(symbol);
        const docRef = doc(db, COLLECTION_NAME, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log(`Found data in Firestore for ${symbol}:`, data.status);
            return data;
        }

        console.log(`No data found in Firestore for ${symbol}`);
        return null;
    } catch (error) {
        console.error('Error fetching from Firestore:', error);
        throw error;
    }
};

/**
 * Create a pending document in Firestore to track the request
 * 
 * @param {string} symbol - Stock symbol
 */
const createPendingDocument = async (symbol) => {
    try {
        const docId = getDocId(symbol);
        const docRef = doc(db, COLLECTION_NAME, docId);

        await setDoc(docRef, {
            status: 'pending',
            symbol,
            range: 'max',
            requestedAt: new Date().toISOString(),
            data: []
        });

        console.log(`Created pending document for ${symbol} (max range)`);
    } catch (error) {
        console.error('Error creating pending document:', error);
        throw error;
    }
};

/**
 * Trigger GitHub Actions workflow to fetch historical data (always max range)
 * 
 * @param {string} symbol - Stock symbol
 * @returns {Promise<boolean>} True if dispatch was successful
 */
export const dispatchGitHubAction = async (symbol) => {
    try {
        console.log(`Dispatching GitHub Action for ${symbol} (max range)`);

        const response = await axios.post(`${BASE_URL}/dispatchGithubAction`, {
            symbol,
            range: 'max'
        });

        console.log('GitHub Action dispatched successfully:', response.data);
        return response.data; // Return consistent data format

    } catch (error) {
        console.error('Error dispatching GitHub Action:', error);
        throw error; // Throw error to be handled by caller (consistent with other API files)
    }
};

/**
 * Wait for historical data to be available in Firestore with polling
 * 
 * @param {string} symbol - Stock symbol
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 10)
 * @param {number} intervalMs - Interval between attempts in ms (default: 5000)
 * @returns {Promise<Object|null>} Historical data or null if timeout
 */
export const waitForHistoricalData = async (
    symbol,
    maxAttempts = 10,
    intervalMs = 5000
) => {
    console.log(`Waiting for data: ${symbol} (max ${maxAttempts} attempts)`);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Wait before checking (except on first attempt)
        if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }

        // Check Firestore
        const data = await fetchHistoricalDataFromFirestore(symbol);

        if (data && data.status === 'completed') {
            console.log(`Data ready after ${attempt + 1} attempts`);
            return data;
        }

        if (data && data.status === 'error') {
            console.error('GitHub Action returned error:', data.error);
            throw new Error(data.error || 'Failed to fetch historical data');
        }

        console.log(`Attempt ${attempt + 1}/${maxAttempts}: Status = ${data?.status || 'not found'}`);
    }

    console.log('Timeout waiting for data');
    return null;
};

/**
 * Main function to get historical data (always fetches max range)
 * - Checks Firestore cache first
 * - If not found or expired, dispatches GitHub Action and waits
 * 
 * @param {string} symbol - Stock symbol
 * @returns {Promise<Object>} Historical data with all available history
 */
export const getHistoricalData = async (symbol) => {
    console.log(`Getting historical data for ${symbol} (max range)`);

    // Check if we already have valid cached data
    const cachedData = await fetchHistoricalDataFromFirestore(symbol);

    if (cachedData && cachedData.status === 'completed' && isCacheValid(cachedData.fetchedAt)) {
        console.log('Using valid cached data');
        return cachedData;
    }

    // Data not found or expired - need to fetch
    console.log('Data not found or expired, requesting new fetch');

    // Create pending document
    if (!cachedData || cachedData.status !== 'pending') await createPendingDocument(symbol);

    // Dispatch GitHub Action
    await dispatchGitHubAction(symbol);

    // Wait for data to become available
    const data = await waitForHistoricalData(symbol);

    if (!data) {
        throw new Error('Timeout waiting for historical data. Please try again.');
    }

    return data;
};
