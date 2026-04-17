import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, UserCircle, Activity, Utensils, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export default function UserNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const { logout, currentUser } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/auth/user/login');
    };

    const navItems = [
        { path: '/user/profile', label: 'Profile', icon: UserCircle },
        { path: '/user/analysis', label: 'Analysis', icon: Activity },
        { path: '/user/planner', label: 'Meal Plan', icon: Utensils }
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            className="glass sticky top-0 z-50 border-b border-white/10"
        >
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                            <span className="text-2xl">🥗</span>
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">NutriX</h1>
                            <p className="text-xs text-gray-400">{currentUser?.name || 'AI-Powered Nutrition'}</p>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex items-center gap-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <button
                                    key={item.path}
                                    onClick={() => navigate(item.path)}
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-smooth
                                        ${isActive
                                            ? 'text-primary bg-primary/10 border border-primary/20'
                                            : 'text-gray-400 hover:text-white hover:bg-white/5'
                                        }
                                    `}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span className="hidden md:inline">{item.label}</span>
                                </button>
                            );
                        })}

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-red-400 hover:bg-red-500/10 transition-smooth ml-2"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden md:inline">Logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.nav>
    );
}
