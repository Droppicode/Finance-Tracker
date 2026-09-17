import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/api/transactions`; // Base path for Vercel Transactions functions

export const processStatement = async (fileBase64, categoriesStr) => {
  try {
    const response = await axios.post(`${BASE_URL}/processStatement`, { fileBase64, categoriesStr });
    return response.data.data;
  } catch (error) {
    console.error("Error processing statement:", error);
    throw error;
  }
};
