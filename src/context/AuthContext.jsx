import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        if (token && userId) {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            localStorage.setItem('token', token);
            localStorage.setItem('userId', userId)
            setIsLoading(false);
        }
        else {
            delete api.defaults.headers.common['Authorization'];
            localStorage.removeItem('token');
            localStorage.removeItem('userId')
            setUser(null);
            setIsLoading(false);
        }
    }, [token,userId])

    const login = (newToken,newUserId) => {
        setToken(newToken)
        setUserId(newUserId)
    }

    const logout = () => {
        setToken(null);
    }

    const value = {
        user, token,userId, login, logout,
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