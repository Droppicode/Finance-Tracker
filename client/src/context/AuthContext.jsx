import React, { createContext, useState, useEffect } from 'react';
import axiosInstance from '../api/axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            axiosInstance.get('/auth/user/')
                .then(res => {
                    setUser(res.data);
                    setIsAuthenticated(true);
                })
                .catch(() => {
                    localStorage.removeItem('token');
                })
                .finally(() => {
                    setIsLoading(false);
                });
        } else {
            setIsAuthenticated(false);
            setIsLoading(false);
        }
    }, []);

    const login = (token) => {
        localStorage.setItem('token', token);
        return axiosInstance.get('/auth/user/')
            .then(res => {
                setUser(res.data);
                setIsAuthenticated(true);
            });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setIsAuthenticated(false);
    };

    if (isLoading) {
        return <div>Loading...</div>; // Ou um componente de spinner
    }

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
