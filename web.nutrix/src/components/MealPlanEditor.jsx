import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Utensils } from 'lucide-react';
import Button from './Button';

/**
 * Slide-over panel for editing meal plan macros
 * @param {Object} props
 * @param {Object} props.mealPlan - Meal plan object
 * @param {Function} props.onSave - Save handler (planId, macros)
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.isOpen - Whether panel is open
 */
export default function MealPlanEditor({ mealPlan, onSave, onClose, isOpen }) {
    const [macros, setMacros] = useState({
        totalCalories: mealPlan?.totalCalories || 0,
        totalCarbs: mealPlan?.totalCarbs || 0,
        totalFats: mealPlan?.totalFats || 0,
        totalProtein: mealPlan?.totalProtein || 0
    });

    const handleChange = (field, value) => {
        setMacros(prev => ({ ...prev, [field]: parseFloat(value) || 0 }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(mealPlan.id, macros);
    };

    return (
        <AnimatePresence>
            {isOpen && mealPlan && (
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
                                    <h2 className="text-2xl font-bold text-white">Edit Meal Plan</h2>
                                    <p className="text-sm text-gray-400 mt-1">Adjust calories and macros</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-smooth"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Current Meals Preview */}
                            <div className="mb-6 p-4 glass-sm rounded-lg">
                                <h3 className="text-sm font-semibold text-gray-300 mb-3">Current Meals</h3>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Breakfast:</span>
                                        <span className="text-white">{mealPlan.breakfast.foods.join(', ')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Lunch:</span>
                                        <span className="text-white">{mealPlan.lunch.foods.join(', ')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-400">Dinner:</span>
                                        <span className="text-white">{mealPlan.dinner.foods.join(', ')}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Macros Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Total Calories */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Total Calories
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={macros.totalCalories}
                                            onChange={(e) => handleChange('totalCalories', e.target.value)}
                                            className="flex-1 px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                            step="1"
                                        />
                                        <span className="text-gray-400 text-sm min-w-[40px]">kcal</span>
                                    </div>
                                </div>

                                {/* Total Carbs */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Total Carbohydrates
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={macros.totalCarbs}
                                            onChange={(e) => handleChange('totalCarbs', e.target.value)}
                                            className="flex-1 px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                            step="0.1"
                                        />
                                        <span className="text-gray-400 text-sm min-w-[40px]">g</span>
                                    </div>
                                </div>

                                {/* Total Fats */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Total Fats
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={macros.totalFats}
                                            onChange={(e) => handleChange('totalFats', e.target.value)}
                                            className="flex-1 px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                            step="0.1"
                                        />
                                        <span className="text-gray-400 text-sm min-w-[40px]">g</span>
                                    </div>
                                </div>

                                {/* Total Protein */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Total Protein
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            value={macros.totalProtein}
                                            onChange={(e) => handleChange('totalProtein', e.target.value)}
                                            className="flex-1 px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                            step="0.1"
                                        />
                                        <span className="text-gray-400 text-sm min-w-[40px]">g</span>
                                    </div>
                                </div>

                                {/* Macro Summary */}
                                <div className="p-4 glass-sm rounded-lg">
                                    <h4 className="text-sm font-semibold text-gray-300 mb-2">Macro Distribution</h4>
                                    <div className="grid grid-cols-3 gap-2 text-center">
                                        <div>
                                            <p className="text-xs text-gray-400">Carbs</p>
                                            <p className="text-lg font-bold text-white">{Math.round((macros.totalCarbs * 4 / macros.totalCalories) * 100 || 0)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Fats</p>
                                            <p className="text-lg font-bold text-white">{Math.round((macros.totalFats * 9 / macros.totalCalories) * 100 || 0)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-400">Protein</p>
                                            <p className="text-lg font-bold text-white">{Math.round((macros.totalProtein * 4 / macros.totalCalories) * 100 || 0)}%</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-4">
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
