import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { createUser } from './models/User';

// Import navigation components
import UserNav from './components/UserNav';
import AdminNav from './components/AdminNav';

// Import customer screens
import ProfileScreen from './features/profile/ProfileScreen';
import AnalysisScreen from './features/analysis/AnalysisScreen';
import PlannerScreen from './features/planner/PlannerScreen';

// Import unified auth screens
import UnifiedLogin from './features/auth/UnifiedLogin';
import UnifiedSignup from './features/auth/UnifiedSignup';

// Import admin screens
import AdminDashboard from './features/admin/AdminDashboard';
import FoodManagement from './features/admin/FoodManagement';
import SuitabilityTable from './features/admin/SuitabilityTable';
import UserManagement from './features/admin/UserManagement';
import ContentModerator from './features/admin/ContentModerator';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
    return (
        <Router>
            <AuthProvider>
                <div className="min-h-screen bg-background">
                    <AppContent />
                </div>
            </AuthProvider>
        </Router>
    );
}

function AppContent() {
    const { currentUser, isAdmin, isUser } = useAuth();
    const [user, setUser] = useState(null);
    const [analysisData, setAnalysisData] = useState(null);

    const handleProfileSave = (profileData) => {
        const newUser = createUser({
            id: user?.id || currentUser?.id || crypto.randomUUID(),
            email: user?.email || currentUser?.email || 'demo@nutrix.com',
            ...profileData
        });
        setUser(newUser);
        console.log('Profile saved:', newUser);
    };

    const handleAnalysisComplete = (data) => {
        setAnalysisData(data);
        console.log('Analysis complete:', data);
    };

    return (
        <>
            {/* Conditional Navigation based on role */}
            {isUser && <UserNav />}
            {isAdmin && <AdminNav />}

            {/* Routes with page transitions */}
            <Routes>
                {/* Default route - redirect to unified login */}
                <Route path="/" element={<Navigate to="/auth/login" replace />} />

                {/* Unified Authentication Routes */}
                <Route
                    path="/auth/login"
                    element={
                        currentUser ? (
                            <Navigate to={isAdmin ? "/admin/dashboard" : "/user/profile"} replace />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <UnifiedLogin />
                            </motion.div>
                        )
                    }
                />
                <Route
                    path="/auth/signup"
                    element={
                        currentUser ? (
                            <Navigate to={isAdmin ? "/admin/dashboard" : "/user/profile"} replace />
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <UnifiedSignup />
                            </motion.div>
                        )
                    }
                />

                {/* Backward compatibility - redirect old auth routes to unified login */}
                <Route path="/auth/user/login" element={<Navigate to="/auth/login" replace />} />
                <Route path="/auth/user/signup" element={<Navigate to="/auth/signup" replace />} />
                <Route path="/auth/admin/login" element={<Navigate to="/auth/login" replace />} />
                <Route path="/auth/admin/signup" element={<Navigate to="/auth/signup" replace />} />

                {/* User Protected Routes */}
                <Route
                    path="/user/profile"
                    element={
                        <ProtectedRoute requiredRole="user">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <ProfileScreen user={user} onSave={handleProfileSave} />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user/analysis"
                    element={
                        <ProtectedRoute requiredRole="user">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <AnalysisScreen onAnalysisComplete={handleAnalysisComplete} />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/user/planner"
                    element={
                        <ProtectedRoute requiredRole="user">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <PlannerScreen userData={user} analysisData={analysisData} />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />

                {/* Admin Protected Routes */}
                <Route
                    path="/admin/dashboard"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <AdminDashboard />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/foods"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <FoodManagement />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/suitability"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <SuitabilityTable />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/users"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <UserManagement />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/admin/content"
                    element={
                        <ProtectedRoute requiredRole="admin">
                            <motion.div
                                initial={{ x: -100, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <ContentModerator />
                            </motion.div>
                        </ProtectedRoute>
                    }
                />

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/auth/login" replace />} />
            </Routes>
        </>
    );
}

export default App;
