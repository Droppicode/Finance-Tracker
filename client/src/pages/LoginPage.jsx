import React, { useContext } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { TrendingUp } from 'lucide-react';
import axiosInstance from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const GoogleIcon = (props) => (
    <svg viewBox="0 0 48 48" {...props}>
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
        <path fill="none" d="M0 0h48v48H0z"></path>
    </svg>
);

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
        <div className="flex flex-col min-h-screen bg-gray-900 md:flex-row">
            {/* Left Panel: Branding */}
            <div className="flex items-center justify-center w-full md:w-1/2">
                <div className="text-center">
                    <div className="flex items-center justify-center">
                        <TrendingUp className="w-12 h-12 text-blue-500" />
                        <h1 className="ml-4 text-5xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent">
                            fin-track
                        </h1>
                    </div>
                    <p className="mt-4 text-lg text-gray-400">
                        Controle suas finanças e investimentos com clareza.
                    </p>
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="flex items-center justify-center w-full p-4 md:w-1/2 bg-gray-800">
                <div className="w-full max-w-sm p-8 space-y-8 bg-gray-700 rounded-xl shadow-lg md:p-12">
                    <h2 className="text-2xl font-semibold text-center text-white">
                        Acesse sua conta
                    </h2>
                    <button
                        onClick={() => handleGoogleLogin()}
                        className="flex items-center justify-center w-full gap-3 px-4 py-3 font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-700 focus:ring-blue-500"
                    >
                        <GoogleIcon className="w-6 h-6" />
                        <span>Entrar com o Google</span>
                    </button>
                    <div className="text-xs text-center text-gray-500">
                        <a href="#" className="hover:underline">Termos de Serviço</a>
                        <span className="mx-2">·</span>
                        <a href="#" className="hover:underline">Política de Privacidade</a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
