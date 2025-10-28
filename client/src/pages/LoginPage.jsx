import React, { useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axiosInstance from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useContext(AuthContext);

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const res = await axiosInstance.post('/auth/google/', {
                    access_token: tokenResponse.access_token,
                });
                await login(res.data.access);
                navigate('/');
            } catch (error) {
                console.error('Google login error:', error);
            }
        },
    });

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
            <div className="p-8 bg-white rounded-lg shadow-md dark:bg-gray-800">
                <h1 className="mb-4 text-2xl font-bold text-center text-gray-800 dark:text-gray-100">Login</h1>
                <button
                    onClick={() => handleGoogleLogin()}
                    className="flex items-center justify-center w-full px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Login with Google
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
