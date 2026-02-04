import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { ACTIVITY_LABELS } from '../../models/User';
import { calculateAllMetrics } from './MetricsCalculator';
import { validateAge, validateWeight, validateHeight } from '../../services/validationService';

export default function ProfileScreen({ user, onSave }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        age: user?.age || '',
        gender: user?.gender || 'male',
        height: user?.height || '',
        weight: user?.weight || '',
        activityLevel: user?.activityLevel || 'moderate'
    });

    const [errors, setErrors] = useState({});
    const [metrics, setMetrics] = useState({
        bmr: 0,
        tdee: 0,
        bmi: 0,
        bmiCategory: 'N/A'
    });

    // Calculate metrics in real-time
    useEffect(() => {
        const calculated = calculateAllMetrics(formData);
        setMetrics(calculated);
    }, [formData.weight, formData.height, formData.age, formData.gender, formData.activityLevel]);

    const handleChange = (field) => (e) => {
        const value = e.target.value;
        setFormData(prev => ({ ...prev, [field]: value }));

        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validate all fields
        const newErrors = {};

        if (!formData.name) newErrors.name = 'Name is required';

        const ageValidation = validateAge(formData.age);
        if (!ageValidation.valid) newErrors.age = ageValidation.message;

        const weightValidation = validateWeight(formData.weight);
        if (!weightValidation.valid) newErrors.weight = weightValidation.message;

        const heightValidation = validateHeight(formData.height);
        if (!heightValidation.valid) newErrors.height = heightValidation.message;

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Save profile with calculated metrics
        onSave({
            ...formData,
            age: parseFloat(formData.age),
            weight: parseFloat(formData.weight),
            height: parseFloat(formData.height),
            bmr: metrics.bmr,
            tdee: metrics.tdee
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background p-6">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gradient mb-2">Profile Management</h1>
                    <p className="text-gray-400">Complete your profile to get personalized nutrition plans</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Personal Information */}
                    <div className="lg:col-span-2">
                        <Card title="Personal Information" className="h-full">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                    label="Age"
                                    type="number"
                                    value={formData.age}
                                    onChange={handleChange('age')}
                                    error={errors.age}
                                    placeholder="30"
                                    min={18}
                                    max={100}
                                    required
                                />

                                <div className="flex flex-col gap-1">
                                    <label className="text-sm font-medium text-gray-300">
                                        Gender <span className="text-primary ml-1">*</span>
                                    </label>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="male"
                                                checked={formData.gender === 'male'}
                                                onChange={handleChange('gender')}
                                                className="w-4 h-4 text-primary focus:ring-primary"
                                            />
                                            <span className="text-white">Male</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="gender"
                                                value="female"
                                                checked={formData.gender === 'female'}
                                                onChange={handleChange('gender')}
                                                className="w-4 h-4 text-primary focus:ring-primary"
                                            />
                                            <span className="text-white">Female</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <Input
                                    label="Height (cm)"
                                    type="number"
                                    value={formData.height}
                                    onChange={handleChange('height')}
                                    error={errors.height}
                                    placeholder="170"
                                    min={100}
                                    max={250}
                                    required
                                />

                                <Input
                                    label="Weight (kg)"
                                    type="number"
                                    value={formData.weight}
                                    onChange={handleChange('weight')}
                                    error={errors.weight}
                                    placeholder="70"
                                    min={30}
                                    max={300}
                                    required
                                />
                            </div>

                            <div className="mt-4">
                                <label className="text-sm font-medium text-gray-300 mb-2 block">
                                    Activity Level <span className="text-primary ml-1">*</span>
                                </label>
                                <select
                                    value={formData.activityLevel}
                                    onChange={handleChange('activityLevel')}
                                    className="w-full px-4 py-3 rounded-lg bg-surface border-2 border-surface-light text-white input-focus transition-smooth"
                                >
                                    {Object.entries(ACTIVITY_LABELS).map(([value, label]) => (
                                        <option key={value} value={value}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mt-6">
                                <Button type="submit" variant="primary" className="w-full md:w-auto">
                                    Save Profile
                                </Button>
                            </div>
                        </Card>
                    </div>

                    {/* Metrics Display */}
                    <div className="lg:col-span-1">
                        <Card title="Your Metrics" variant="orange" className="sticky top-6">
                            <div className="space-y-4">
                                <MetricDisplay
                                    label="BMR"
                                    value={metrics.bmr}
                                    unit="cal/day"
                                    description="Calories burned at rest"
                                    icon="🔥"
                                />

                                <MetricDisplay
                                    label="TDEE"
                                    value={metrics.tdee}
                                    unit="cal/day"
                                    description="Total daily energy expenditure"
                                    icon="⚡"
                                />

                                <MetricDisplay
                                    label="BMI"
                                    value={metrics.bmi}
                                    unit={metrics.bmiCategory}
                                    description="Body mass index"
                                    icon="📊"
                                />
                            </div>

                            {metrics.tdee > 0 && (
                                <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg">
                                    <p className="text-sm text-gray-300">
                                        ℹ️ Your meal plans will be tailored to your {metrics.tdee} calorie daily target
                                    </p>
                                </div>
                            )}
                        </Card>
                    </div>
                </form>
            </div>
        </div>
    );
}

function MetricDisplay({ label, value, unit, description, icon }) {
    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-orange rounded-lg p-4"
        >
            <div className="flex items-center gap-3">
                <span className="text-3xl">{icon}</span>
                <div className="flex-1">
                    <p className="text-sm text-gray-400">{label}</p>
                    <p className="text-2xl font-bold text-primary">
                        {value > 0 ? value : '—'}
                    </p>
                    <p className="text-xs text-gray-500">{unit}</p>
                </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">{description}</p>
        </motion.div>
    );
}
