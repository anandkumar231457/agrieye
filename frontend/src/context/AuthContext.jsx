import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // On mount: try to restore auth from stored JWT
    useEffect(() => {
        const token = localStorage.getItem('agrieye_token');
        if (token) {
            // Send JWT in header - this works even after cold starts
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            checkAuth();
        } else {
            setLoading(false);
        }
    }, []);

    const checkAuth = async () => {
        try {
            const response = await api.get('/auth/me');
            setUser(response.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.error('Auth check failed:', error);
            // Token invalid/expired - clear it
            localStorage.removeItem('agrieye_token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };

    const login = async (credential) => {
        try {
            const response = await api.post('/auth/google', { credential });
            const { token, user: userData, isNewUser } = response.data;

            // Store JWT in localStorage (survives page refresh AND server cold starts)
            if (token) {
                localStorage.setItem('agrieye_token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }

            setUser(userData);
            setIsAuthenticated(true);
            return { success: true, isNewUser };
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
            localStorage.removeItem('agrieye_token');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    const updateUser = (userData) => {
        setUser(prev => ({ ...prev, ...userData }));
    };

    return (
        <AuthContext.Provider value={{ user, loading, isAuthenticated, login, logout, updateUser, checkAuth }}>
            {children}
        </AuthContext.Provider>
    );
};
