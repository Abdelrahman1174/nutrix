import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Mail, Lock, Key, User } from 'lucide-react';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../contexts/AuthContext';
import { registerAdmin } from '../../controllers/adminController';
import { validatePassword } from '../../services/validationService';

export default function AdminSignup() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        secretKey: ''
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ strength: 0, message: '' });

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }

        // Check password strength
        if (field === 'password') {
            const strength = validatePassword(value);
            setPasswordStrength(strength);
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
        if (!formData.secretKey) newErrors.secretKey = 'Secret key is required';

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        const passwordCheck = validatePassword(formData.password);
        if (!passwordCheck.valid) {
            newErrors.password = passwordCheck.message;
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            setIsLoading(false);
            return;
        }

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Register
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
        navigate('/auth/admin/login');
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
                    <h1 className="text-3xl font-bold text-gradient mb-2">Create Admin Account</h1>
                    <p className="text-gray-400">Join the NutriX admin team</p>
                </div>

                {/* Signup Card */}
                <Card className="glass-orange">
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
                            placeholder="admin@nutrix.com"
                            required
                        />

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={handleChange('password')}
                                error={errors.password}
                                placeholder="••••••••"
                                required
                            />
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 bg-surface rounded-full h-2">
                                            <div
                                                className={`h-full rounded-full transition-all ${passwordStrength.strength >= 80
                                                    ? 'bg-fit'
                                                    : passwordStrength.strength >= 60
                                                        ? 'bg-primary'
                                                        : passwordStrength.strength >= 40
                                                            ? 'bg-hypertension'
                                                            : 'bg-anemia'
                                                    }`}
                                                style={{ width: `${passwordStrength.strength}%` }}
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-gray-400">{passwordStrength.message}</p>
                                </div>
                            )}
                        </div>

                        <Input
                            label="Confirm Password"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={handleChange('confirmPassword')}
                            error={errors.confirmPassword}
                            placeholder="••••••••"
                            required
                        />

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

                        <Button
                            type="submit"
                            variant="primary"
                            loading={isLoading}
                            className="w-full"
                        >
                            Create Account
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-400">
                            Already have an account?{' '}
                            <Link to="/admin/login" className="text-primary hover:text-primary-light font-medium">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}
