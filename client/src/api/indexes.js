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

  const url = `https://api.bcb.gov.br/dados/serie/bcdata.sgs.${seriesId}/dados`;
  
  try {
    const response = await axiosInstance.get(url, {
      params: {
        formato: 'json',
        dataInicial: formatDate(startDate),
        dataFinal: formatDate(endDate),
      },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching daily rates for series ${seriesId}:`, error);
    throw error;
  }
};
