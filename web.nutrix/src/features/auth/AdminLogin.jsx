import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock } from 'lucide-react';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { authenticateAdmin } from '../../controllers/adminController';

export default function AdminLogin() {
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

        // Authenticate
        const result = authenticateAdmin(formData.email, formData.password);

        if (!result.success) {
            setErrors({ general: result.message || 'Invalid email or password' });
            setIsLoading(false);
            return;
        }

        // Login via context
        login(result.admin, 'admin', formData.rememberMe);

        // Navigate to dashboard
        navigate('/admin/dashboard');
        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">NutriX Admin</h1>
                    <p className="text-gray-400">Sign in to manage nutrition database</p>
                </div>

                {/* Login Card */}
                <Card className="glass-orange">
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
                            placeholder="admin@nutrix.com"
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
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Don't have an account?{' '}
                            <Link to="/auth/admin/signup" className="text-primary hover:text-primary-light font-medium">
                                Sign up
                            </Link>
                        </p>
                    </div>
                </Card>

                {/* Demo Credentials */}
                <div className="mt-6 p-4 glass rounded-lg">
                    <p className="text-xs text-gray-500 text-center mb-2">Quick Demo Login:</p>
                    <button
                        onClick={() => {
                            setFormData(prev => ({
                                ...prev,
                                email: 'admin@nutrix.com',
                                password: 'admin123'
                            }));
                        }}
                        className="text-xs text-primary hover:text-primary-light transition-smooth"
                    >
                        Click here: admin@nutrix.com / admin123
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
