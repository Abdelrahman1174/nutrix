import React from 'react';
import { motion } from 'framer-motion';
import Card from '../../components/Card';

export default function MealCard({ meal, index }) {
    const getMealIcon = (mealName) => {
        const icons = {
            'Breakfast': '☀️',
            'Lunch': '🌤️',
            'Dinner': '🌙'
        };
        return icons[mealName] || '🍽️';
    };

    const getMealGradient = (mealName) => {
        const gradients = {
            'Breakfast': 'from-yellow-500/20 to-orange-500/20',
            'Lunch': 'from-orange-500/20 to-red-500/20',
            'Dinner': 'from-purple-500/20 to-blue-500/20'
        };
        return gradients[mealName] || 'from-primary/20 to-primary-dark/20';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2, duration: 0.4 }}
        >
            <Card hoverable className={`bg-gradient-to-br ${getMealGradient(meal.name)} border-2 border-primary/30`}>
                <div className="flex items-center gap-3 mb-4">
                    <span className="text-4xl">{getMealIcon(meal.name)}</span>
                    <h3 className="text-2xl font-bold text-white">{meal.name}</h3>
                </div>

                {/* Food Items */}
                <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-400 mb-2">Menu</h4>
                    <ul className="space-y-2">
                        {meal.foods.map((food, idx) => (
                            <motion.li
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 * idx }}
                                className="flex items-start gap-2 text-white"
                            >
                                <span className="text-primary mt-0.5">•</span>
                                <span>{food}</span>
                            </motion.li>
                        ))}
                    </ul>
                </div>

                {/* Macro Breakdown */}
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Total Calories</span>
                        <span className="text-lg font-bold text-primary">{meal.calories} cal</span>
                    </div>

                    <MacroBar label="Carbs" value={meal.carbs} color="bg-yellow-500" unit="g" />
                    <MacroBar label="Protein" value={meal.protein} color="bg-red-500" unit="g" />
                    <MacroBar label="Fats" value={meal.fats} color="bg-blue-500" unit="g" />
                </div>
            </Card>
        </motion.div>
    );
}

function MacroBar({ label, value, color, unit }) {
    const maxValue = 100; // For display purposes
    const percentage = Math.min((value / maxValue) * 100, 100);

    return (
        <div>
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-400">{label}</span>
                <span className="text-sm font-semibold text-white">{value}{unit}</span>
            </div>
            <div className="w-full bg-surface rounded-full h-2">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    className={`${color} h-full rounded-full`}
                />
            </div>
        </div>
    );
}
