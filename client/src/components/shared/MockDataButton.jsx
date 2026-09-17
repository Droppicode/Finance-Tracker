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
        <button
            onClick={handlePopulate}
            disabled={isLoading}
            className="flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:from-purple-600 hover:to-indigo-700 transition-all font-medium fixed bottom-6 right-6 lg:bottom-10 lg:right-10 z-50 hover:scale-105 animate-bounce disabled:opacity-50 disabled:animate-none"
        >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Database className="w-5 h-5" />}
            {isLoading ? "Gerando Dados Mágicos..." : "Preencher Conta de Teste"}
        </button>
    );
}
