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

export const getRates = async (seriesId, startDate, endDate, periodicity) => {
  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const endpoint = periodicity === 'daily' ? '/api/daily-rates/' : '/api/monthly-rates/';

  try {
    const response = await axiosInstance.get(endpoint, {
      params: {
        series_id: seriesId,
        start_date: formatDate(startDate),
        end_date: formatDate(endDate),
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching ${periodicity} rates for series ${seriesId}:`, error);
    throw error;
  }
};
