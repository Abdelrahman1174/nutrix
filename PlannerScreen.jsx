import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, RefreshCw, Clock, X, AlertTriangle } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MealCard from './MealCard';
import { generateMealPlan } from '../../services/ragService';
import { saveMealPlan, getMealPlanHistory, getActivePlanForPeriod } from '../../services/mealPlanService';
import { updatePlanFrequency, loadPlanFrequencyLocal } from '../../services/profileService';
import { useAuth } from '../../contexts/AuthContext';
import { isSupabaseReady } from '../../services/supabaseClient';
import { isGoogleFitConnected, getTodayFitnessData, stepsToActivityLevel } from '../../services/googleFitService';
import { getStepSource, fetchPedometerSteps } from '../../services/pedometerService';
import { ACTIVITY_LABELS } from '../../models/User';

// Convert a DB meal_plans row (with nested meals[]) to frontend plan shape
function dbPlanToFrontend(row) {
    if (!row) return null;
    const meals = row.meals || [];
    const byType = (type) => meals.find(m => m.meal_type === type) || {};
    return {
        id:            row.plan_id,
        totalCalories: row.total_calories,
        totalProtein:  row.total_protein,
        totalCarbs:    row.total_carbs,
        totalFats:     row.total_fats,
        generatedAt:   row.generated_at || row.plan_date,
        plan_date:     row.plan_date,
        breakfast: { name: 'Breakfast', calories: byType('breakfast').meal_calories, protein: byType('breakfast').meal_protein, carbs: byType('breakfast').meal_carbs, fats: byType('breakfast').meal_fats, foods: [] },
        lunch:     { name: 'Lunch',     calories: byType('lunch').meal_calories,     protein: byType('lunch').meal_protein,     carbs: byType('lunch').meal_carbs,     fats: byType('lunch').meal_fats,     foods: [] },
        dinner:    { name: 'Dinner',    calories: byType('dinner').meal_calories,    protein: byType('dinner').meal_protein,    carbs: byType('dinner').meal_carbs,    fats: byType('dinner').meal_fats,    foods: [] },
    };
}

function periodLabel(frequency) {
    const today = new Date();
    if (frequency === 'daily') {
        return today.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }
    const dow = today.getDay();
    const diffToMon = (dow === 0 ? -6 : 1 - dow);
    const monday = new Date(today);
    monday.setDate(today.getDate() + diffToMon);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const fmt = (d) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${fmt(monday)} – ${fmt(sunday)}`;
}

export default function PlannerScreen({ userData, analysisData, persistedPlan, onMealPlanChange }) {
    const { currentUser } = useAuth();

    const [mealPlan, setMealPlan]           = useState(null);
    const [isGenerating, setIsGenerating]   = useState(false);
    const [isLoading, setIsLoading]         = useState(true);
    const [planHistory, setPlanHistory]     = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [viewingPlan, setViewingPlan]     = useState(null);
    const [error, setError]                 = useState(null);
    const [frequency, setFrequency]         = useState(() =>
        loadPlanFrequencyLocal(currentUser?.id) || userData?.planFrequency || 'weekly'
    );
    const [googleFitCalories, setGoogleFitCalories] = useState(null);
    const [fitActivityLevel, setFitActivityLevel] = useState(null);
    const [fitSource, setFitSource]         = useState('static'); // 'static' | 'fit' | 'steps'

    // Keep a ref to avoid stale closures in async flows
    const frequencyRef = useRef(frequency);
    frequencyRef.current = frequency;

    const effectiveUser = userData || analysisData?.userData || null;

    // -----------------------------------------------------------------------
    // Core: generate a new plan and save it
    // -----------------------------------------------------------------------
    const generateAndSave = async () => {
        if (!effectiveUser) return;
        setIsGenerating(true);
        setError(null);
        try {
            // Always re-fetch from the currently selected source so regenerate is never stale
            let fitCaloriesOverride = null;
            let fitActivityOverride = null;
            const source = getStepSource();

            if (source === 'google_fit' && isGoogleFitConnected()) {
                const fitnessData = await getTodayFitnessData();
                fitCaloriesOverride = fitnessData?.calories ?? null;
                fitActivityOverride = stepsToActivityLevel(fitnessData?.steps);
            } else if (source === 'pedometer') {
                try {
                    const pedometerSteps = await fetchPedometerSteps();
                    fitActivityOverride = stepsToActivityLevel(pedometerSteps);
                } catch { /* device unreachable — fall back to static */ }
            }

            // Sync UI state with fresh values
            setGoogleFitCalories(fitCaloriesOverride);
            setFitActivityLevel(fitActivityOverride);
            setFitSource(fitCaloriesOverride != null ? 'fit' : fitActivityOverride ? 'steps' : 'static');

            // Priority 1: Google Fit calories → direct TDEE override (most accurate)
            // Priority 2: step-based activity level → ragService uses it via estimateTdee()
            const userDataForPlan = {
                ...effectiveUser,
                ...(fitCaloriesOverride != null && { tdee: fitCaloriesOverride }),
                ...(fitActivityOverride && fitCaloriesOverride == null && { activityLevel: fitActivityOverride }),
            };

            const plan = await generateMealPlan(
                userDataForPlan,
                analysisData?.biomarkers || [],
                analysisData?.prediction?.condition || 'fit'
            );
            setMealPlan(plan);
            onMealPlanChange?.(plan);

            if (currentUser?.id && isSupabaseReady) {
                saveMealPlan(currentUser.id, plan, effectiveUser?.goal || 'maintain')
                    .then(async () => {
                        const hist = await getMealPlanHistory(currentUser.id, 10);
                        setPlanHistory(hist);
                    })
                    .catch(err => console.warn('[Nutrix] Meal plan save failed:', err));
            }
        } catch (err) {
            console.error('[Nutrix] generateMealPlan error:', err);
            setError('Failed to generate meal plan. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    // -----------------------------------------------------------------------
    // On mount / when frequency or user changes: load active plan or generate
    // -----------------------------------------------------------------------
    useEffect(() => {
        if (!currentUser?.id) { setIsLoading(false); return; }

        let cancelled = false;

        const run = async () => {
            setIsLoading(true);
            setError(null);

            if (!isSupabaseReady) {
                // Mock mode: use persisted plan or auto-generate
                if (persistedPlan) {
                    setMealPlan(persistedPlan);
                } else if (effectiveUser) {
                    await generateAndSave();
                }
                if (!cancelled) setIsLoading(false);
                return;
            }

            // Supabase mode: look for an active plan for this period
            try {
                const activeRow = await getActivePlanForPeriod(currentUser.id, frequencyRef.current);
                if (cancelled) return;
                if (activeRow) {
                    const plan = dbPlanToFrontend(activeRow);
                    setMealPlan(plan);
                    onMealPlanChange?.(plan);
                } else if (effectiveUser) {
                    // No plan yet for this period — auto-generate with current source data
                    await generateAndSave();
                }
            } catch (e) {
                console.warn('[Nutrix] loadActivePlan error:', e);
            } finally {
                if (!cancelled) setIsLoading(false);
            }

            // Load history (non-blocking)
            if (!cancelled) {
                setHistoryLoading(true);
                getMealPlanHistory(currentUser.id, 10)
                    .then(hist => { if (!cancelled) setPlanHistory(hist); })
                    .finally(() => { if (!cancelled) setHistoryLoading(false); });
            }
        };

        run();
        return () => { cancelled = true; };
    }, [currentUser?.id, frequency, effectiveUser?.id ?? effectiveUser?.email]);

    // -----------------------------------------------------------------------
    // Frequency toggle
    // -----------------------------------------------------------------------
    const handleFrequencyChange = (newFreq) => {
        if (newFreq === frequency) return;
        setFrequency(newFreq);
        setMealPlan(null);
        if (currentUser?.id && isSupabaseReady) {
            updatePlanFrequency(currentUser.id, newFreq)
                .catch(err => console.warn('[Nutrix] updatePlanFrequency failed:', err));
        }
    };

    const busy = isLoading || isGenerating;

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background p-6">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* ── Header ── */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
                >
                    <div>
                        <h1 className="text-4xl font-bold text-gradient mb-1">Meal Planner</h1>
                        <p className="text-gray-400">
                            Personalized nutrition plan based on your profile and health analysis
                        </p>
                        {fitSource === 'fit' && googleFitCalories && (
                            <p className="mt-1 text-xs text-green-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                                Based on Google Fit — {googleFitCalories.toLocaleString()} kcal burned today
                            </p>
                        )}
                        {fitSource === 'steps' && fitActivityLevel && (
                            <p className="mt-1 text-xs text-green-400 flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                                Activity: {(ACTIVITY_LABELS[fitActivityLevel] ?? '').split('(')[0].trim()}
                                {getStepSource() === 'pedometer' ? ' — from hardware pedometer' : ' — from step count'}
                            </p>
                        )}
                    </div>

                    {/* Frequency Toggle */}
                    <div className="flex items-center gap-2 glass rounded-xl p-1 self-start sm:self-auto">
                        <Calendar className="w-4 h-4 text-primary ml-2" />
                        <span className="text-xs text-gray-400 mr-1">Schedule:</span>
                        {['daily', 'weekly'].map(f => (
                            <button
                                key={f}
                                onClick={() => handleFrequencyChange(f)}
                                disabled={busy}
                                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-smooth capitalize disabled:opacity-50 ${
                                    frequency === f
                                        ? 'bg-primary text-black'
                                        : 'text-gray-400 hover:text-white'
                                }`}
                            >
                                {f}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* ── Error ── */}
                {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* ── Current Plan Area ── */}
                <AnimatePresence mode="wait">
                    {busy && (
                        <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Card>
                                <div className="text-center py-16">
                                    <div className="flex justify-center mb-6">
                                        <svg className="animate-spin h-16 w-16 text-primary" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2">
                                        {isGenerating ? 'Generating Your Meal Plan…' : 'Loading Your Plan…'}
                                    </h3>
                                    <p className="text-gray-400">
                                        {isGenerating
                                            ? 'AI is analyzing your profile and creating personalized recommendations…'
                                            : 'Fetching your current meal plan…'}
                                    </p>
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {!busy && !mealPlan && (
                        <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <Card>
                                <div className="text-center py-16">
                                    <div className="text-5xl mb-4">🥗</div>
                                    <h3 className="text-2xl font-bold text-white mb-2">No Plan Yet</h3>
                                    <p className="text-gray-400 mb-6">
                                        {effectiveUser
                                            ? 'Generate your first meal plan for this period.'
                                            : 'Complete your profile to get a personalized meal plan.'}
                                    </p>
                                    {effectiveUser && (
                                        <Button variant="primary" onClick={() => generateAndSave()}>
                                            Generate Meal Plan
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </motion.div>
                    )}

                    {!busy && mealPlan && (
                        <motion.div
                            key="plan"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-4"
                        >
                            {/* Period label + Regenerate */}
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-primary uppercase tracking-wider">
                                        {frequency === 'daily' ? 'Today' : 'This Week'}
                                    </span>
                                    <span className="text-gray-400 text-sm">{periodLabel(frequency)}</span>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => generateAndSave()}
                                    className="text-sm flex items-center gap-2"
                                >
                                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                                </Button>
                            </div>

                            {/* Macro Summary */}
                            <Card variant="orange">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <SummaryItem label="Total Calories" value={mealPlan.totalCalories} unit="cal" icon="🔥" />
                                    <SummaryItem label="Total Carbs"    value={mealPlan.totalCarbs}    unit="g"   icon="🌾" />
                                    <SummaryItem label="Total Protein"  value={mealPlan.totalProtein}  unit="g"   icon="🥩" />
                                    <SummaryItem label="Total Fats"     value={mealPlan.totalFats}     unit="g"   icon="🥑" />
                                </div>
                            </Card>

                            {/* Meal Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <MealCard meal={mealPlan.breakfast} index={0} />
                                <MealCard meal={mealPlan.lunch}     index={1} />
                                <MealCard meal={mealPlan.dinner}    index={2} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Past Plans ── */}
                {(planHistory.length > 0 || historyLoading) && (
                    <div>
                        <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" /> Past Plans
                        </h2>
                        {historyLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-14 glass rounded-lg animate-pulse" />
                                ))}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {planHistory.map((row) => {
                                    const dateStr = row.plan_date || row.generated_at?.split('T')[0];
                                    const displayDate = dateStr
                                        ? new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                                        : '—';
                                    return (
                                        <div
                                            key={row.plan_id}
                                            className="flex items-center justify-between p-4 glass rounded-lg hover:bg-primary/5 transition-smooth"
                                        >
                                            <div>
                                                <p className="text-white font-medium text-sm">{displayDate}</p>
                                                <p className="text-xs text-gray-400">
                                                    {row.total_calories} cal &middot; {row.total_protein}g protein
                                                </p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                onClick={() => setViewingPlan(dbPlanToFrontend(row))}
                                                className="text-xs px-3 py-1.5"
                                            >
                                                View
                                            </Button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── History Detail Modal ── */}
            <AnimatePresence>
                {viewingPlan && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setViewingPlan(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-4xl glass rounded-2xl p-6 space-y-4 overflow-y-auto max-h-[90vh]"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-white">Plan Details</h3>
                                    <p className="text-sm text-gray-400">
                                        {viewingPlan.plan_date
                                            ? new Date(viewingPlan.plan_date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                                            : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setViewingPlan(null)}
                                    className="p-2 rounded-lg hover:bg-white/10 transition-smooth"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-4 bg-white/5 rounded-xl">
                                <SummaryItem label="Calories" value={viewingPlan.totalCalories} unit="cal" icon="🔥" />
                                <SummaryItem label="Carbs"    value={viewingPlan.totalCarbs}    unit="g"   icon="🌾" />
                                <SummaryItem label="Protein"  value={viewingPlan.totalProtein}  unit="g"   icon="🥩" />
                                <SummaryItem label="Fats"     value={viewingPlan.totalFats}     unit="g"   icon="🥑" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <MealCard meal={viewingPlan.breakfast} index={0} />
                                <MealCard meal={viewingPlan.lunch}     index={1} />
                                <MealCard meal={viewingPlan.dinner}    index={2} />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
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
