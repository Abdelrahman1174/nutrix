import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, Shield, Mail, Lock, User, Key } from 'lucide-react';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { registerUser } from '../../controllers/userController';
import { registerAdmin } from '../../controllers/adminController';

export default function UnifiedSignup() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [accountType, setAccountType] = useState('user'); // 'user' or 'admin'
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: '' // Only for admin
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (field) => (e) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
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
        if (!formData.name) newErrors.name = 'Name is required';
        if (!formData.email) newErrors.email = 'Email is required';
        if (!formData.password) newErrors.password = 'Password is required';
        if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }
        if (accountType === 'admin' && !formData.secretKey) {
            newErrors.secretKey = 'Admin secret key is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        if (accountType === 'admin') {
            // Register as admin
            const result = registerAdmin(
                formData.email,
                formData.password,
                formData.name,
                formData.secretKey
            );

            if (!result.success) {
                setErrors({ general: result.message });
                setIsLoading(false);
                return;
            }

            // Redirect to login
            navigate('/auth/login');
        } else {
            // Register as user
            const result = registerUser(formData.email, formData.password, formData.name);

            if (!result.success) {
                setErrors({ general: result.message });
                setIsLoading(false);
                return;
            }

            // Auto-login
            login(result.user, 'user', true);
            navigate('/user/profile');
        }

        setIsLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-md"
            >
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 gradient-primary rounded-2xl mb-4">
                        <UserPlus className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gradient mb-2">Create Account</h1>
                    <p className="text-gray-400">Join NutriX today</p>
                </div>

                {/* Account Type Selector */}
                <div className="mb-6 flex gap-2">
                    <button
                        onClick={() => setAccountType('user')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-smooth ${accountType === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-surface text-gray-400 hover:bg-surface-light'
                            }`}
                    >
                        <User className="w-4 h-4" />
                        Regular User
                    </button>
                    <button
                        onClick={() => setAccountType('admin')}
                        className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-medium transition-smooth ${accountType === 'admin'
                                ? 'bg-primary text-white'
                                : 'bg-surface text-gray-400 hover:bg-surface-light'
                            }`}
                    >
                        <Shield className="w-4 h-4" />
                        Administrator
                    </button>
                </div>

                {/* Signup Card */}
                <Card className={accountType === 'admin' ? 'glass-orange' : 'glass'}>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {errors.general && (
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                                {errors.general}
                            </div>
                        )}

                        <Input
                            label="Full Name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange('name')}
                            error={errors.name}
                            placeholder="John Doe"
                            required
                        />

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

                        <Input
                            label="Confirm Password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            error={errors.confirmPassword}
                            placeholder="••••••••"
                            required
                        />

                        {accountType === 'admin' && (
                            <div className="relative">
                                <Input
                                    label="Admin Secret Key"
                                    type="password"
                                    value={formData.secretKey}
                                    onChange={handleChange('secretKey')}
                                    error={errors.secretKey}
                                    placeholder="Enter admin secret key"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Demo key: NUTRIX_ADMIN_2026
                                </p>
                            </div>
                        )}

                        <Button
                            type="submit"
                            variant="primary"
                            loading={isLoading}
                            className="w-full"
                        >
                            Create {accountType === 'admin' ? 'Admin' : 'User'} Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/auth/login" className="text-primary hover:text-primary-light font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
