import axios from 'axios';

let showNotification = () => {};

export const setNotificationHandler = (handler) => {
  showNotification = handler;
};

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
});

axiosInstance.interceptors.request.use(config => {
    if (!navigator.onLine) {
        showNotification('Você está offline. Verifique sua conexão com a internet.', 'error');
        return Promise.reject(new Error('Network Error'));
    }

    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default axiosInstance;
