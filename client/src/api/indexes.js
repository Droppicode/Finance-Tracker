import axios from 'axios';

const BASE_URL = '/api/bcb'; // Base path for Vercel BCB functions

export const getRates = async (seriesId, startDate, endDate, periodicity) => {
  try {
    const params = { seriesId, startDate, endDate };
    let response;
    if (periodicity === 'daily') {
      response = await axios.post(`${BASE_URL}/getDailySeries`, params);
    } else { // monthly
      response = await axios.post(`${BASE_URL}/getMonthlySeries`, params);
    }
    return response.data.data; // Vercel functions return { data: ... }
  } catch (error) {
    console.error(`Error fetching rates for series ${seriesId}:`, error);
    throw error;
  }
};
