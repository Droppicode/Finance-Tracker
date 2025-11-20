import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const BASE_URL = `${API_BASE_URL}/api/brapi`; // Base path for Vercel Brapi functions

const downloadCsv = (symbol, data) => {
  data = data.historicalDataPrice;
  console.log(data.historicalDataPrice);

  const headers = Object.keys(data[0]);
  const replacer = (key, value) => (value === null ? '' : value);
  const rows = data.map(row => headers.map(fieldName => JSON.stringify(row[fieldName], replacer)).join(','));
  const csvString = [headers.join(','), ...rows].join('\r\n');

  const filename = `${symbol}_data.csv`;
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');

  if (link.download !== undefined) { // Feature detection for download attribute
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Clean up the URL object
  }
};

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

