import axiosInstance from './axios';

export const getIndexes = async () => {
  try {
    const response = await axiosInstance.get('/api/indexes/');
    return response.data;
  } catch (error) {
    console.error('Error fetching indexes:', error);
    throw error;
  }
};

export const getDailyRates = async (seriesId, startDate, endDate) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  try {
    const response = await axiosInstance.get('/api/daily-rates/', {
      params: {
        series_id: seriesId,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching daily rates for series ${seriesId}:`, error);
    throw error;
  }
};

export const getMonthlyRates = async (seriesId, startDate, endDate) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  try {
    const response = await axiosInstance.get('/api/monthly-rates/', {
      params: {
        series_id: seriesId,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching monthly rates for series ${seriesId}:`, error);
    throw error;
  }
};
