import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    const [isLoading, setIsLoading] = useState(true)


    useEffect(()=>{ // auth clean
        localStorage.removeItem('userId');
        localStorage.removeItem('role');
    },[])

    useEffect(()=>{ // token-only
        const initAuth = async ()=>{
            if(!token) {setIsLoading(false); return;}

            try{
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                const response = await api.get("/auth/me");
                setUser(response.data);
            }catch(error)
            {
                console.error("Failed to auth check");
                logout();
            }finally{
                setIsLoading(false);
            }
        }
        initAuth();
    },[token])

    const login = (newToken) => {
        localStorage.setItem('token', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken)
    }

    const logout = async ()=>{
        try{
            await api.post("/auth/logout");
        }catch(error)
        {
            console.error("Failed to logout");
        }finally{
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
            delete api.defaults.headers.common['Authorization'];
            window.location.href = "/login";
        }
    }

    const updateUser = (newData)=>{
        setUser(prev => ({...prev, ...newData}))
    }

    const value = {
        user, token,
        userId : user?._id,
        userRole : user?.role || 'user',
        isAdmin: user?.role==='admin',
        login, logout,
        isLoggedIn: !!user,
        updateUser
    }


    
    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => {
    return useContext(AuthContext);
};