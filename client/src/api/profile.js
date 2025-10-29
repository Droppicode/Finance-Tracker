import axiosInstance from './axios';

export const getProfile = () => axiosInstance.get('/api/profile/');

export const updateProfile = (profile) => axiosInstance.patch('/api/profile/', profile);
