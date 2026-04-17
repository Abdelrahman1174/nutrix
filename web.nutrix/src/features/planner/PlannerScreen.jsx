import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MealCard from './MealCard';
import { generateMealPlan } from '../../services/ragService';

export default function PlannerScreen({ userData, analysisData }) {
    const [mealPlan, setMealPlan] = useState(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [planHistory, setPlanHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const handleGeneratePlan = async () => {
        setIsGenerating(true);
        try {
            const plan = await generateMealPlan(
                userData,
                analysisData?.biomarkers || [],
                analysisData?.prediction?.condition || 'fit'
            );

            setMealPlan(plan);

            // Add to history
            setPlanHistory(prev => [plan, ...prev]);
        } catch (error) {
            console.error('Error generating meal plan:', error);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRestorePlan = (plan) => {
        setMealPlan(plan);
        setShowHistory(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-gradient mb-2">Meal Planner</h1>
                            <p className="text-gray-400">
                                Personalized nutrition plan based on your profile and health analysis
                            </p>
                        </div>
                        {planHistory.length > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setShowHistory(!showHistory)}
                            >
                                {showHistory ? 'Hide' : 'View'} History ({planHistory.length})
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* History View */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mb-6"
                        >
                            <Card title="Plan History">
                                <div className="space-y-3">
                                    {planHistory.map((plan, index) => (
                                        <div
                                            key={plan.id}
                                            className="flex items-center justify-between p-4 glass rounded-lg hover:bg-primary/5 transition-smooth"
                                        >
                                            <div>
                                                <p className="text-white font-medium">
                                                    Plan generated on {new Date(plan.generatedAt).toLocaleDateString()}
                                                </p>
                                                <p className="text-sm text-gray-400">
                                                    {plan.totalCalories} calories • {plan.totalProtein}g protein
                                                </p>
                                            </div>
                                            <Button
                                                variant="primary"
                                                onClick={() => handleRestorePlan(plan)}
                                                className="text-sm px-4 py-2"
                                            >
                                                Restore
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </Card>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Meal Plan Display */}
                <AnimatePresence mode="wait">
                    {!mealPlan && !isGenerating && (
                        <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card>
                                <div className="text-center py-16">
                                    <svg className="w-24 h-24 mx-auto mb-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    <h3 className="text-2xl font-bold text-white mb-2">Ready to Create Your Meal Plan</h3>
                                    <p className="text-gray-400 mb-6">
                                        Generate a personalized nutrition plan tailored to your needs
                                    </p>
                                    <Button variant="primary" onClick={handleGeneratePlan}>
                                        Generate Meal Plan
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {isGenerating && (
                        <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <Card>
                                <div className="text-center py-16">
                                    <div className="flex justify-center mb-6">
                                        <svg className="animate-spin h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">Generating Your Meal Plan</h3>
                                    <p className="text-gray-400">
                                        AI is analyzing your profile and creating personalized recommendations...
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {mealPlan && !isGenerating && (
                        <motion.div
                            key="plan"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* Summary Card */}
                            <Card variant="orange">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <SummaryItem label="Total Calories" value={mealPlan.totalCalories} unit="cal" icon="🔥" />
                                    <SummaryItem label="Total Carbs" value={mealPlan.totalCarbs} unit="g" icon="🌾" />
                                    <SummaryItem label="Total Protein" value={mealPlan.totalProtein} unit="g" icon="🥩" />
                                    <SummaryItem label="Total Fats" value={mealPlan.totalFats} unit="g" icon="🥑" />
                                </div>
                                <div className="mt-4 flex gap-3">
                                    <Button variant="primary" onClick={handleGeneratePlan} className="flex-1">
                                        Regenerate Plan
                                    </Button>
                                </div>
                            </Card>

                            {/* Meal Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MealCard meal={mealPlan.breakfast} index={0} />
                                <MealCard meal={mealPlan.lunch} index={1} />
                                <MealCard meal={mealPlan.dinner} index={2} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

function SummaryItem({ label, value, unit, icon }) {
    return (
        <div className="text-center">
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-sm text-gray-400 mb-1">{label}</div>
            <div className="text-2xl font-bold text-primary">
                {value}<span className="text-sm ml-1">{unit}</span>
            </div>
        </div>
    );
}
