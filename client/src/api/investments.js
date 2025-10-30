import axiosInstance from './axios';

export const getInvestments = () => axiosInstance.get('/api/investments/');
export const createInvestment = (data) => axiosInstance.post('/api/investments/', data);
export const updateInvestment = (id, data) => axiosInstance.put(`/api/investments/${id}/`, data);
export const deleteInvestment = (id) => axiosInstance.delete(`/api/investments/${id}/`);
