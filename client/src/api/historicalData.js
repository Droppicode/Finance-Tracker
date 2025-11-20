import { db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import axios from 'axios';

const COLLECTION_NAME = 'historical-data';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get document ID for a symbol and range combination
 */
const getDocId = (symbol, range) => `${symbol}_${range}`;

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
 * Fetch historical data from Firestore
 * 
 * @param {string} symbol - Stock symbol (e.g., 'PETR4')
 * @param {string} range - Time range ('1w', '1mo', etc.)
 * @returns {Promise<Object|null>} Historical data or null if not found
 */
export const fetchHistoricalDataFromFirestore = async (symbol, range) => {
    try {
        const docId = getDocId(symbol, range);
        const docRef = doc(db, COLLECTION_NAME, docId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log(`Found data in Firestore for ${symbol} ${range}:`, data.status);
            return data;
        }

        console.log(`No data found in Firestore for ${symbol} ${range}`);
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
 * @param {string} range - Time range
 */
const createPendingDocument = async (symbol, range) => {
    try {
        const docId = getDocId(symbol, range);
        const docRef = doc(db, COLLECTION_NAME, docId);

        await setDoc(docRef, {
            status: 'pending',
            symbol,
            range,
            requestedAt: new Date().toISOString(),
            data: []
        });

        console.log(`Created pending document for ${symbol} ${range}`);
    } catch (error) {
        console.error('Error creating pending document:', error);
        throw error;
    }
};

/**
 * Trigger GitHub Actions workflow to fetch historical data
 * 
 * @param {string} symbol - Stock symbol
 * @param {string} range - Time range
 * @returns {Promise<boolean>} True if dispatch was successful
 */
export const dispatchGitHubAction = async (symbol, range) => {
    try {
        const GITHUB_TOKEN = import.meta.env.VITE_GITHUB_TOKEN;
        const GITHUB_REPO_OWNER = import.meta.env.VITE_GITHUB_REPO_OWNER;
        const GITHUB_REPO_NAME = import.meta.env.VITE_GITHUB_REPO_NAME;

        if (!GITHUB_TOKEN || !GITHUB_REPO_OWNER || !GITHUB_REPO_NAME) {
            console.error('GitHub configuration is missing. Check environment variables.');
            return false;
        }

        const url = `https://api.github.com/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/dispatches`;

        console.log(`Dispatching GitHub Action for ${symbol} ${range}`);

        const response = await axios.post(
            url,
            {
                event_type: 'fetch-historical-data',
                client_payload: {
                    symbol,
                    range
                }
            },
            {
                headers: {
                    'Accept': 'application/vnd.github.v3+json',
                    'Authorization': `token ${GITHUB_TOKEN}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('GitHub Action dispatched successfully:', response.status);
        return true;

    } catch (error) {
        console.error('Error dispatching GitHub Action:', error);
        return false;
    }
};

/**
 * Wait for historical data to be available in Firestore with polling
 * 
 * @param {string} symbol - Stock symbol
 * @param {string} range - Time range
 * @param {number} maxAttempts - Maximum number of polling attempts (default: 15)
 * @param {number} intervalMs - Interval between attempts in ms (default: 2000)
 * @returns {Promise<Object|null>} Historical data or null if timeout
 */
export const waitForHistoricalData = async (
    symbol,
    range,
    maxAttempts = 15,
    intervalMs = 2000
) => {
    console.log(`Waiting for data: ${symbol} ${range} (max ${maxAttempts} attempts)`);

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
        // Wait before checking (except on first attempt)
        if (attempt > 0) {
            await new Promise(resolve => setTimeout(resolve, intervalMs));
        }

        // Check Firestore
        const data = await fetchHistoricalDataFromFirestore(symbol, range);

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
 * Main function to get historical data
 * - Checks Firestore cache first
 * - If not found or expired, dispatches GitHub Action and waits
 * 
 * @param {string} symbol - Stock symbol
 * @param {string} range - Time range
 * @returns {Promise<Object>} Historical data
 */
export const getHistoricalData = async (symbol, range) => {
    console.log(`Getting historical data for ${symbol} ${range}`);

    // Check if we already have valid cached data
    const cachedData = await fetchHistoricalDataFromFirestore(symbol, range);

    if (cachedData && cachedData.status === 'completed' && isCacheValid(cachedData.fetchedAt)) {
        console.log('Using valid cached data');
        return cachedData;
    }

    // Data not found or expired - need to fetch
    console.log('Data not found or expired, requesting new fetch');

    // Create pending document
    await createPendingDocument(symbol, range);

    // Dispatch GitHub Action
    const dispatched = await dispatchGitHubAction(symbol, range);

    if (!dispatched) {
        throw new Error('Failed to dispatch GitHub Action. Check configuration.');
    }

    // Wait for data to become available
    const data = await waitForHistoricalData(symbol, range);

    if (!data) {
        throw new Error('Timeout waiting for historical data. Please try again.');
    }

    return data;
};
