import axiosInstance from './axios';

export const getInvestments = () => axiosInstance.get('/api/investments/');
export const createInvestment = (data) => axiosInstance.post('/api/investments/', data);
export const updateInvestment = (id, data) => axiosInstance.put(`/api/investments/${id}/`, data);
export const deleteInvestment = (id) => axiosInstance.delete(`/api/investments/${id}/`);

export const getOtherInvestments = () => axiosInstance.get('/api/other-investments/');
export const createOtherInvestment = (data) => axiosInstance.post('/api/other-investments/', data);
export const deleteOtherInvestment = (id) => axiosInstance.delete(`/api/other-investments/${id}/`);
