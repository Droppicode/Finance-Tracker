import React, { useState, useEffect } from 'react';
import { getProfile } from '../../api/profile';
import { populateMockData } from '../../utils/mockData';
import { Database, Loader2 } from 'lucide-react';
import { auth } from '../../api/firebase';

export default function MockDataButton() {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isAnonymous, setIsAnonymous] = useState(false);

    useEffect(() => {
        const checkProfile = async () => {
            if (auth.currentUser) {
                // Only show for anonymous users to prevent real users from accidentally clicking it
                if (auth.currentUser.isAnonymous) {
                    setIsAnonymous(true);
                    try {
                        const profile = await getProfile();
                        if (!profile.hasPopulatedMockData) {
                            setIsVisible(true);
                        }
                    } catch (error) {
                        console.error("Failed to fetch profile", error);
                    }
                }
            }
        };
        
        // Slight delay to ensure auth is fully initialized
        const timeout = setTimeout(checkProfile, 1000);
        return () => clearTimeout(timeout);
    }, []);

    const handlePopulate = async () => {
        setIsLoading(true);
        try {
            await populateMockData();
            setIsVisible(false);
            // Force a reload so all contexts refetch the newly generated data
            window.location.reload();
        } catch (error) {
            console.error("Failed to populate mock data", error);
            alert("Erro ao gerar dados de teste.");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isVisible || !isAnonymous) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-[100] p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center border border-indigo-500/30">
                <div className="bg-indigo-100 dark:bg-indigo-900/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Database className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-4">Bem-vindo ao Modo Teste!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg leading-relaxed">
                    Sua conta está vazia. Clique no botão abaixo para preencher o aplicativo com **dezenas de dados fakes** (transações, despesas, ações, criptomoedas e FIIs) para você testar todas as funcionalidades!
                </p>
                <button
                    onClick={handlePopulate}
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-4 rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all font-bold text-lg hover:scale-105 disabled:opacity-50 disabled:hover:scale-100"
                >
                    {isLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Database className="w-6 h-6" />}
                    {isLoading ? "Gerando Dados Mágicos..." : "Preencher Conta de Teste"}
                </button>
            </div>
        </div>
    );
}
