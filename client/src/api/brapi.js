import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/api/brapi`; // Base path for Vercel Brapi functions

export const searchSymbol = async (symbol) => {
  try {
    const response = await axios.post(`${BASE_URL}/searchSymbol`, { symbol });
    return response.data.data; // Vercel functions return { data: ... }
  } catch (error) {
    console.error("Error searching symbol:", error);
    throw error;
  }
};

export const getQuote = async (symbol, range, interval) => {
  try {
    const response = await axios.post(`${BASE_URL}/getQuote`, { symbol, range, interval });
    return response.data.data; // Vercel functions return { data: ... }
  } catch (error) {
    console.error("Error getting quote:", error);
    throw error;
  }
};

