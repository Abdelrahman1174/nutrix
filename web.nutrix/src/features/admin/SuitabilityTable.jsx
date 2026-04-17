import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Check,
    X,
    ArrowLeft,
    Loader2,
    AlertTriangle,
    Save
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
    getSuitabilityMatrix,
    updateFoodSuitability
} from '../../controllers/adminController';
import { db } from '../../services/mockDatabase';
import { CONDITION_LABELS } from '../../models/FoodSuitability';

export default function SuitabilityTable() {
    const navigate = useNavigate();
    const [matrix, setMatrix] = useState([]);
    const [admin, setAdmin] = useState(null);
    const [loadingCell, setLoadingCell] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        // Get admin
        const sessionAdmin = sessionStorage.getItem('nutrix_admin');
        const localAdmin = localStorage.getItem('nutrix_admin');
        const adminData = sessionAdmin || localAdmin;

        if (adminData) {
            setAdmin(JSON.parse(adminData));
        }

        // Load suitability matrix
        loadMatrix();
    }, []);

    const loadMatrix = () => {
        const data = getSuitabilityMatrix();
        setMatrix(data);
    };

    const handleToggleSuitability = async (foodId, conditionId, currentValue) => {
        const newValue = !currentValue;
        setLoadingCell(`${foodId}_${conditionId}`);
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`${foodId}_${conditionId}`];
            return newErrors;
        });

        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));

        // Try to update (FR-14 validation happens in controller)
        const result = updateFoodSuitability(
            foodId,
            conditionId,
            newValue,
            admin?.email || 'unknown'
        );

        if (!result.success) {
            // Validation failed (FR-14)
            setValidationErrors(prev => ({
                ...prev,
                [`${foodId}_${conditionId}`]: result.message
            }));
            setLoadingCell(null);
            return;
        }

        // Update successful
        loadMatrix();
        setLoadingCell(null);
    };

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <nav className="glass sticky top-0 z-50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/admin/dashboard')}
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </Button>
                            <div>
                                <h1 className="text-xl font-bold text-white">Food Suitability Matrix</h1>
                                <p className="text-xs text-gray-400">
                                    Configure which foods are suitable for each health condition
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Matrix Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                <Card className="glass">
                    {/* Validation Alert */}
                    {Object.keys(validationErrors).length > 0 && (
                        <div className="mb-4 p-4 bg-anemia/10 border border-anemia/20 rounded-lg">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-5 h-5 text-anemia flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-anemia font-semibold mb-2">Clinical Safety Alert (FR-14)</p>
                                    {Object.entries(validationErrors).map(([key, message]) => (
                                        <p key={key} className="text-sm text-anemia/90">{message}</p>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left p-4 text-gray-400 font-semibold sticky left-0 bg-surface z-10">
                                        Food Name
                                    </th>
                                    {db.conditions.map(condition => (
                                        <th key={condition.id} className="text-center p-4 text-gray-400 font-semibold min-w-[140px]">
                                            <div className="flex flex-col items-center gap-1">
                                                <span>{CONDITION_LABELS[condition.id]}</span>
                                                <span className="text-xs font-normal opacity-60">
                                                    {condition.description}
                                                </span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence>
                                    {matrix.map((row, index) => (
                                        <motion.tr
                                            key={row.food.id}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.02 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-smooth"
                                        >
                                            <td className="p-4 sticky left-0 bg-surface z-10">
                                                <div>
                                                    <p className="text-white font-medium">{row.food.name}</p>
                                                    <p className="text-xs text-gray-500">{row.food.category}</p>
                                                </div>
                                            </td>
                                            {db.conditions.map(condition => {
                                                const isSuitable = row.suitability[condition.id];
                                                const cellKey = `${row.food.id}_${condition.id}`;
                                                const isLoading = loadingCell === cellKey;
                                                const hasError = !!validationErrors[cellKey];

                                                return (
                                                    <td key={condition.id} className="p-4 text-center">
                                                        <button
                                                            onClick={() => handleToggleSuitability(row.food.id, condition.id, isSuitable)}
                                                            disabled={isLoading}
                                                            className={`
                                w-12 h-12 rounded-lg flex items-center justify-center
                                transition-smooth mx-auto
                                ${isLoading ? 'cursor-wait opacity-50' : 'cursor-pointer'}
                                ${hasError ? 'bg-anemia/20 border-2 border-anemia animate-pulse' : ''}
                                ${!hasError && isSuitable ? 'bg-fit/20 hover:bg-fit/30 border border-fit/30' : ''}
                                ${!hasError && !isSuitable ? 'bg-anemia/20 hover:bg-anemia/30 border border-anemia/30' : ''}
                              `}
                                                        >
                                                            {isLoading ? (
                                                                <Loader2 className="w-6 h-6 text-primary animate-spin" />
                                                            ) : isSuitable ? (
                                                                <Check className="w-6 h-6 text-fit" />
                                                            ) : (
                                                                <X className="w-6 h-6 text-anemia" />
                                                            )}
                                                        </button>
                                                    </td>
                                                );
                                            })}
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>

                    {/* Legend */}
                    <div className="mt-6 pt-6 border-t border-white/10">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-fit/20 border border-fit/30 flex items-center justify-center">
                                        <Check className="w-5 h-5 text-fit" />
                                    </div>
                                    <span className="text-sm text-gray-400">Suitable</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded bg-anemia/20 border border-anemia/30 flex items-center justify-center">
                                        <X className="w-5 h-5 text-anemia" />
                                    </div>
                                    <span className="text-sm text-gray-400">Not Suitable</span>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500">
                                Click any cell to toggle suitability. Clinical validation (FR-14) applies automatically.
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
