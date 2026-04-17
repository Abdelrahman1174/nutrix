import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, User, Mail, Lock, ArrowRight } from 'lucide-react';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { authenticateAdmin } from '../../controllers/adminController';
import { authenticateUser } from '../../controllers/userController';

export default function UnifiedLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field) => (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        // Validate
        const newErrors = {};
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Try authenticating as admin first
        const adminResult = authenticateAdmin(formData.email, formData.password);

        if (adminResult.success) {
            // Admin login successful
            login(adminResult.admin, 'admin', formData.rememberMe);
            navigate('/admin/dashboard');
            setIsLoading(false);
            return;
        }

        // Try authenticating as regular user
        const userResult = authenticateUser(formData.email, formData.password);

        if (userResult.success) {
            // User login successful
            login(userResult.user, 'user', formData.rememberMe);
            navigate('/user/profile');
            setIsLoading(false);
            return;
        }

        // Both failed - invalid credentials
        setErrors({ general: 'Invalid email or password' });
        setIsLoading(false);
    };

    const fillDemoUser = () => {
        setFormData(prev => ({
            ...prev,
            email: 'user@nutrix.com',
            password: 'user123'
        }));
    };

    const fillDemoAdmin = () => {
        setFormData(prev => ({
            ...prev,
            email: 'admin@nutrix.com',
            password: 'admin123'
        }));
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 gradient-primary rounded-2xl mb-4 relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-3xl">🥗</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-bold text-gradient mb-2">Welcome to NutriX</h1>
                    <p className="text-gray-400">Sign in to access your dashboard</p>
                </div>

                {/* Login Card */}
                <Card className="glass">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.general && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {errors.general}
                            </div>
                        )}

                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={handleChange('email')}
                            error={errors.email}
                            placeholder="you@example.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange('password')}
                            error={errors.password}
                            placeholder="••••••••"
                            required
                        />

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.rememberMe}
                                    onChange={handleChange('rememberMe')}
                                    className="w-4 h-4 rounded border-surface-light bg-surface text-primary focus:ring-primary focus:ring-offset-0"
                                />
                                <span className="text-sm text-gray-400">Remember me</span>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            variant="primary"
                            loading={isLoading}
                            className="w-full"
                        >
                            <span className="flex items-center justify-center gap-2">
                                Sign In
                                <ArrowRight className="w-4 h-4" />
                            </span>
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/auth/signup" className="text-primary hover:text-primary-light font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </Card>

                {/* Demo Credentials */}
                <div className="mt-6 glass rounded-lg p-4 space-y-3">
                    <p className="text-xs text-gray-500 text-center font-medium">Quick Demo Login:</p>

                    <div className="flex gap-2">
                        <button
                            onClick={fillDemoUser}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-surface hover:bg-surface-light border border-white/10 transition-smooth group"
                        >
                            <User className="w-4 h-4 text-primary" />
                            <div className="text-left">
                                <p className="text-xs font-medium text-white">User</p>
                                <p className="text-xs text-gray-500">user@nutrix.com</p>
                            </div>
                        </button>

                        <button
                            onClick={fillDemoAdmin}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-surface hover:bg-surface-light border border-primary/20 transition-smooth group"
                        >
                            <Shield className="w-4 h-4 text-primary" />
                            <div className="text-left">
                                <p className="text-xs font-medium text-white">Admin</p>
                                <p className="text-xs text-gray-500">admin@nutrix.com</p>
                            </div>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
