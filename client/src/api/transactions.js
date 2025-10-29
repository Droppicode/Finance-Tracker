import axiosInstance from './axios';

export const getTransactions = () => axiosInstance.get('/api/transactions/');

export const createTransaction = (transaction) => axiosInstance.post('/api/transactions/', transaction);

export const updateTransaction = (id, transaction) => axiosInstance.patch(`/api/transactions/${id}/`, transaction);

export const deleteTransaction = (id) => axiosInstance.delete(`/api/transactions/${id}/`);
