import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route Component
 * Prevents unauthorized access and enforces role-based routing
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Protected content
 * @param {'admin' | 'user'} props.requiredRole - Required role to access route
 */
export default function ProtectedRoute({ children, requiredRole = 'admin' }) {
    const { currentUser, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        // Show loading spinner while checking authentication
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <svg className="animate-spin h-12 w-12 text-primary" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <p className="text-gray-400">Verifying authentication...</p>
                </div>
            </div>
        );
    }

    // Not authenticated at all
    if (!currentUser) {
        const loginPath = requiredRole === 'admin' ? '/auth/admin/login' : '/auth/user/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    // Authenticated but wrong role
    if (currentUser.role !== requiredRole) {
        // Admin trying to access user routes - redirect to admin dashboard
        if (currentUser.role === 'admin') {
            return <Navigate to="/admin/dashboard" replace />;
        }
        // User trying to access admin routes - redirect to user login
        if (currentUser.role === 'user') {
            return <Navigate to="/auth/user/login" replace />;
        }
    }

    // Authenticated with correct role
    return children;
}
