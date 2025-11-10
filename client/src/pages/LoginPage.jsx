import React, { useContext, useEffect } from 'react';
import { TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { auth } from '../api/firebase';
import { GoogleAuthProvider, signInWithPopup, signInWithCredential } from 'firebase/auth';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

const GoogleLoginButton = () => {
    const navigate = useNavigate();

    const handleGoogleLogin = async () => {
        if (Capacitor.isNativePlatform()) {
            try {
                console.log('trying to login natively');
                const login = await SocialLogin.login({
                    provider: 'google',
                    options: {
                        scopes: ['email', 'profile'],
                    },
                });
                console.log('Native Google Login Result:', JSON.stringify(login));

                const result = login.result;
                const credential = GoogleAuthProvider.credential(result.idToken, result.accessToken);
                await signInWithCredential(auth, credential);
                console.log('Usuário logado nativamente:', auth.currentUser);
                navigate('/');
            } catch (error) {
                console.error('Error during native Google login:', error);
            }
        } else {
            const provider = new GoogleAuthProvider();
            try {
                await signInWithPopup(auth, provider);
                navigate('/');
            } catch (error) {
                console.error('Google login error:', error);
            }
        }
    };

    return (
        <button
            onClick={handleGoogleLogin}
            className="flex items-center justify-center px-4 py-2 bg-white text-gray-800 font-semibold rounded-lg shadow-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-200 ease-in-out"
        >
            {/* Google 'G' Logo SVG */}
            <svg className="w-5 h-5 mr-2" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg">
                <path d="M533.5 272.3c0-18.7-1.5-36.8-4.7-54.3H272.1v104.8h147c-6.1 33.8-25.7 63.7-55.6 83.2v68h87.7c51.5-47.4 81.6-117.4 81.6-201.7z" fill="#4285F4"/>
                <path d="M272.1 544.3c73.4 0 135.3-24.1 180.4-65.7l-87.7-68c-24.4 16.4-55.9 26-92.6 26-71 0-130.6-48.1-152.9-112.3H28.9v70.1c46.2 91.9 140.3 154.3 243.2 154.3z" fill="#34A853"/>
                <path d="M119.2 324.3c-11.3-33.8-11.3-70.7 0-104.5V150H28.9c-38.6 76.9-38.6 167.5 0 244.4l90.3-70.1z" fill="#FBBC05"/>
                <path d="M272.1 107.7c38.8-0.1 76.9 14.1 105.2 41.9L429.6 78C388.8 29.8 331.2 0 272.1 0 169.2 0 75.1 62.4 28.9 154.3l90.3 70.1c22.3-64.2 81.9-112.3 152.9-112.3z" fill="#EA4335"/>
            </svg>
            Entrar com o Google
        </button>
    );
};

const LoginPage = () => {
    const navigate = useNavigate();
    const { isAuthenticated } = useContext(AuthContext);

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated, navigate]);

    useEffect(() => {
        const initializeSocialLogin = async () => {
            console.log('initializing social login online please');
            await SocialLogin.initialize({
                google: {
                    webClientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    mode: 'online',
                },
            });
        };
        if (Capacitor.isNativePlatform()) {
            initializeSocialLogin();
        }
    }, []);

    return (
        <div className="flex flex-col min-h-screen bg-gray-900 md:flex-row">
            {/* Left Panel: Branding */}
            <div className="flex flex-1 items-center justify-center w-full md:w-1/2">
                <div className="text-center">
                    <div className="flex items-center justify-center">
                        <TrendingUp className="w-12 h-12 text-blue-500" />
                        <h1 className="ml-4 text-4xl font-bold bg-gradient-to-r from-blue-500 to-green-400 bg-clip-text text-transparent md:text-5xl">
                            fin-track
                        </h1>
                    </div>
                    <p className="mt-4 text-base text-gray-400 md:text-lg">
                        Controle suas finanças e investimentos com clareza.
                    </p>
                </div>
            </div>

            {/* Right Panel: Login Form */}
            <div className="flex flex-1 items-center justify-center w-full p-4 md:w-1/2 bg-gray-800">
                <div className="w-full max-w-sm p-6 bg-gray-700 rounded-xl shadow-lg md:p-8 lg:p-12 flex flex-col items-center justify-center gap-8">
                    <h2 className="text-xl font-semibold text-center text-white md:text-2xl">
                        Acesse sua conta
                    </h2>
                    <div className="flex justify-center">
                        <GoogleLoginButton />
                    </div>
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
