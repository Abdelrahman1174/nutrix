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
import { fetchSuitabilityMatrix, fetchConditions, updateFoodSuitabilityApi } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

export default function SuitabilityTable() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [matrix, setMatrix] = useState([]);
    const [conditions, setConditions] = useState([]);
    const [loadingCell, setLoadingCell] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [validationErrors, setValidationErrors] = useState({});

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setIsLoading(true);
            setError(null);
            
            const [matrixData, conditionsData] = await Promise.all([
                fetchSuitabilityMatrix(),
                fetchConditions()
            ]);
            
            setMatrix(matrixData || []);
            setConditions(conditionsData || []);
        } catch (err) {
            console.error('Failed to load matrix data', err);
            setError(t('error_loading_data', 'Failed to load data. Please try again later.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSuitability = async (foodId, conditionId, currentValue) => {
        const newValue = !currentValue;
        setLoadingCell(`${foodId}_${conditionId}`);
        setValidationErrors(prev => {
            const newErrors = { ...prev };
            delete newErrors[`${foodId}_${conditionId}`];
            return newErrors;
        });

        try {
            const result = await updateFoodSuitabilityApi(
                foodId,
                conditionId,
                newValue,
                currentUser?.email || 'unknown'
            );

            if (!result.success) {
                setValidationErrors(prev => ({
                    ...prev,
                    [`${foodId}_${conditionId}`]: result.message || t('error_update_failed', 'Update failed')
                }));
            } else {
                await loadData();
            }
        } catch (err) {
            console.error('Error updating suitability', err);
            setValidationErrors(prev => ({
                ...prev,
                [`${foodId}_${conditionId}`]: t('error_network', 'Network error occurred')
            }));
        } finally {
            setLoadingCell(null);
        }
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
                                <h1 className="text-xl font-bold text-white">{t('food_suitability_matrix', 'Food Suitability Matrix')}</h1>
                                <p className="text-xs text-gray-400">
                                    {t('food_suitability_desc', 'Configure which foods are suitable for each health condition')}
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

                    {/* Async States Container */}
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center p-12">
                            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                            <p className="text-gray-400">{t('loading_matrix', 'Loading matrix data...')}</p>
                        </div>
                    ) : error ? (
                        <div className="p-12 text-center flex flex-col items-center">
                            <AlertTriangle className="w-12 h-12 text-red-500 mb-4" />
                            <p className="text-red-400 font-medium mb-4">{error}</p>
                            <Button variant="outline" onClick={loadData}>
                                {t('retry', 'Retry')}
                            </Button>
                        </div>
                    ) : matrix.length === 0 ? (
                        <div className="p-12 text-center text-gray-400">
                            {t('no_data', 'No suitability data available')}
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left p-4 text-gray-400 font-semibold sticky left-0 bg-surface z-10">
                                            {t('food_name', 'Food Name')}
                                        </th>
                                        {conditions.map(condition => (
                                            <th key={condition.id} className="text-center p-4 text-gray-400 font-semibold min-w-[140px]">
                                                <div className="flex flex-col items-center gap-1">
                                                    <span>{condition.name || condition.id}</span>
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
                                            {conditions.map(condition => {
                                                const isSuitable = row.suitability && row.suitability[condition.id];
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
                    )}

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
                                {t('matrix_legend_desc', 'Click any cell to toggle suitability. Clinical validation applies automatically.')}
                            </p>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
