import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || null)
    //const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
    //const [userRole, setUserRole] = useState(localStorage.getItem('role') || 'user');
    const [isLoading, setIsLoading] = useState(true)

    /*useEffect(() => {
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
    }, [token,userId])*/

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
        //localStorage.setItem('userId', newUserId);
        //localStorage.setItem('role', newRole || 'user');
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        setToken(newToken)
        //setUserId(newUserId)
        //setUserRole(newRole || 'user');
    }

    const logout = () => {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        //localStorage.removeItem('userId');
        //localStorage.removeItem('role');
        //setUserRole('user');
        setToken(null);
        setUser(null);
    }

    const value = {
        user, token,
        userId : user?._id,
        userRole : user?.role || 'user',
        isAdmin: user?.role==='admin',
        login, logout,
        isLoggedIn: !!user
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