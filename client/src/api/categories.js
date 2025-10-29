import axiosInstance from './axios';

export const getCategories = () => axiosInstance.get('/api/categories/');

export const createCategory = (category) => axiosInstance.post('/api/categories/', category);

export const deleteCategory = (id) => axiosInstance.delete(`/api/categories/${id}/`);
