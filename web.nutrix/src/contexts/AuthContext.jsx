import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Authentication Context
 * Manages global authentication state for both admins and regular users
 */

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing session on mount
    useEffect(() => {
        checkSession();
    }, []);

    const checkSession = () => {
        try {
            // Check for admin session
            const adminSession = sessionStorage.getItem('nutrix_admin');
            const adminLocal = localStorage.getItem('nutrix_admin');
            const adminData = adminSession || adminLocal;

            if (adminData) {
                const admin = JSON.parse(adminData);
                setCurrentUser({ ...admin, role: 'admin' });
                setLoading(false);
                return;
            }

            // Check for user session
            const userSession = sessionStorage.getItem('nutrix_user');
            const userLocal = localStorage.getItem('nutrix_user');
            const userData = userSession || userLocal;

            if (userData) {
                const user = JSON.parse(userData);
                setCurrentUser({ ...user, role: 'user' });
                setLoading(false);
                return;
            }

            setLoading(false);
        } catch (error) {
            console.error('Error checking session:', error);
            setLoading(false);
        }
    };

    const login = (userData, role, rememberMe = false) => {
        const userWithRole = { ...userData, role };
        setCurrentUser(userWithRole);

        // Store in appropriate storage based on rememberMe preference
        const storage = rememberMe ? localStorage : sessionStorage;
        const storageKey = role === 'admin' ? 'nutrix_admin' : 'nutrix_user';
        storage.setItem(storageKey, JSON.stringify(userData));
    };

    const logout = () => {
        setCurrentUser(null);

        // Clear all storage
        sessionStorage.removeItem('nutrix_admin');
        sessionStorage.removeItem('nutrix_user');
        localStorage.removeItem('nutrix_admin');
        localStorage.removeItem('nutrix_user');
    };

    const value = {
        currentUser,
        loading,
        login,
        logout,
        isAuthenticated: !!currentUser,
        isAdmin: currentUser?.role === 'admin',
        isUser: currentUser?.role === 'user'
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}
