import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);



    // Check authentication status on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Auth check failed:', error);
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credential) => {
        try {
            const response = await api.post('/auth/google', { credential });
            setUser(response.data.user);
            setIsAuthenticated(true);
            return { success: true, isNewUser: response.data.isNewUser };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.response?.data?.error || 'Login failed' };
        }
    };

    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    const value = {
        user,
        loading,
        isAuthenticated,
        login,
        logout,
        updateUser,
        checkAuth
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
