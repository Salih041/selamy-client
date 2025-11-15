import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../api';

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (token) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);

            setIsLoading(false);
        }
        else {
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            setUser(null);
            setIsLoading(false);
        }
    }, [token])

    const login = (newToken) => {
        setToken(newToken)
    }

    const logout = () => {
        setToken(null);
    }

    const value = {
        user, token, login, logout,
        isLoggedIn: !!token
    }


    if (isLoading) return <p>loading</p>

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
};