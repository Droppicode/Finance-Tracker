import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/api/transactions`; // Base path for Vercel Transactions functions

export const processStatement = async (text) => {
  console.log("Calling processStatement API with text (first 200 chars):", text.substring(0, 200));
  try {
    const response = await axios.post(`${BASE_URL}/processStatement`, { text });
    console.log("Received response from processStatement API.");
    return response.data.data; // Vercel functions return { data: ... }
  } catch (error) {
    console.error("Error processing statement:", error);
    throw error;
  }
};
