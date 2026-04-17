import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';
import { ACTIVITY_LABELS } from '../models/User';

/**
 * Slide-over panel for editing user profile details
 * @param {Object} props
 * @param {Object} props.user - User object to edit
 * @param {Function} props.onSave - Save handler (user, updates)
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.isOpen - Whether panel is open
 */
export default function UserProfileEditor({ user, onSave, onClose, isOpen }) {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        weight: user?.weight || 0,
        height: user?.height || 0,
        age: user?.age || 0,
        activityLevel: user?.activityLevel || 'moderate',
        gender: user?.gender || 'male'
    });

    const [errors, setErrors] = useState({});

    const handleChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Valid email is required';
        }

        if (formData.weight <= 0 || formData.weight > 300) {
            newErrors.weight = 'Weight must be between 1-300 kg';
        }

        if (formData.height <= 0 || formData.height > 250) {
            newErrors.height = 'Height must be between 1-250 cm';
        }

        if (formData.age <= 0 || formData.age > 120) {
            newErrors.age = 'Age must be between 1-120 years';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) {
            onSave(user, formData);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />

                    {/* Slide-over panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md glass border-l border-white/10 z-50 overflow-y-auto"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Edit User Profile</h2>
                                    <p className="text-sm text-gray-400 mt-1">Update user details and health metrics</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-smooth"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        className="w-full px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                    />
                                    {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
                                </div>

                                {/* Email */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        className="w-full px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                    />
                                    {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
                                </div>

                                {/* Physical Metrics Section */}
                                <div className="pt-4 border-t border-white/10">
                                    <h3 className="text-lg font-semibold text-white mb-4">Physical Metrics</h3>

                                    {/* Weight */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Weight (kg)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.weight}
                                            onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                                            step="0.1"
                                            className="w-full px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                        />
                                        {errors.weight && <p className="text-red-400 text-xs mt-1">{errors.weight}</p>}
                                    </div>

                                    {/* Height */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Height (cm)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.height}
                                            onChange={(e) => handleChange('height', parseFloat(e.target.value))}
                                            step="0.1"
                                            className="w-full px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                        />
                                        {errors.height && <p className="text-red-400 text-xs mt-1">{errors.height}</p>}
                                    </div>

                                    {/* Age */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Age (years)
                                        </label>
                                        <input
                                            type="number"
                                            value={formData.age}
                                            onChange={(e) => handleChange('age', parseInt(e.target.value))}
                                            className="w-full px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                        />
                                        {errors.age && <p className="text-red-400 text-xs mt-1">{errors.age}</p>}
                                    </div>

                                    {/* Gender */}
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Gender
                                        </label>
                                        <select
                                            value={formData.gender}
                                            onChange={(e) => handleChange('gender', e.target.value)}
                                            className="w-full px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                        >
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* Activity Level */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            Activity Level
                                        </label>
                                        <select
                                            value={formData.activityLevel}
                                            onChange={(e) => handleChange('activityLevel', e.target.value)}
                                            className="w-full px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                        >
                                            {Object.entries(ACTIVITY_LABELS).map(([key, label]) => (
                                                <option key={key} value={key}>
                                                    {label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-6">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="primary"
                                        className="flex-1"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
