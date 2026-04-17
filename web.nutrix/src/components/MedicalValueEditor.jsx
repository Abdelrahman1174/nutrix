import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Activity } from 'lucide-react';
import Button from './Button';
import { getMedicalValuesByReport, correctMedicalValue } from '../controllers/adminController';
import { showSuccess, showError } from '../utils/toastUtils';

/**
 * Slide-over panel for editing biomarker values from a medical report
 * @param {Object} props
 * @param {string} props.reportId - Medical report ID
 * @param {Function} props.onClose - Close handler
 * @param {boolean} props.isOpen - Whether panel is open
 * @param {string} props.adminEmail - Admin email for audit log
 */
export default function MedicalValueEditor({ reportId, onClose, isOpen, adminEmail }) {
    const [biomarkers, setBiomarkers] = useState([]);
    const [editedValues, setEditedValues] = useState({});

    useEffect(() => {
        if (isOpen && reportId) {
            loadBiomarkers();
        }
    }, [isOpen, reportId]);

    const loadBiomarkers = () => {
        const values = getMedicalValuesByReport(reportId);
        setBiomarkers(values);

        // Initialize edited values
        const initial = {};
        values.forEach(b => {
            initial[b.id] = b.value;
        });
        setEditedValues(initial);
    };

    const handleValueChange = (biomarkerId, newValue) => {
        setEditedValues(prev => ({
            ...prev,
            [biomarkerId]: parseFloat(newValue)
        }));
    };

    const handleSave = () => {
        let hasErrors = false;

        // Save each modified value
        biomarkers.forEach(biomarker => {
            const newValue = editedValues[biomarker.id];

            if (newValue !== biomarker.value) {
                const result = correctMedicalValue(reportId, biomarker.id, newValue, adminEmail);

                if (!result.success) {
                    showError(result.message);
                    hasErrors = true;
                }
            }
        });

        if (!hasErrors) {
            showSuccess('Medical values updated successfully');
            onClose();
        }
    };

    const getStatusColor = (biomarker) => {
        const value = editedValues[biomarker.id] || biomarker.value;

        if (value < biomarker.normalMin) {
            return 'text-anemia bg-anemia/20';
        } else if (value > biomarker.normalMax) {
            return 'text-hypertension bg-hypertension/20';
        }
        return 'text-fit bg-fit/20';
    };

    const getStatusLabel = (biomarker) => {
        const value = editedValues[biomarker.id] || biomarker.value;

        if (value < biomarker.normalMin) return 'LOW';
        if (value > biomarker.normalMax) return 'HIGH';
        return 'NORMAL';
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
                                    <h2 className="text-2xl font-bold text-white">Edit Biomarkers</h2>
                                    <p className="text-sm text-gray-400 mt-1">Correct extracted medical values</p>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-smooth"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Biomarkers List */}
                            <div className="space-y-4">
                                {biomarkers.length === 0 ? (
                                    <p className="text-gray-400 text-center py-8">No biomarkers found</p>
                                ) : (
                                    biomarkers.map((biomarker, index) => (
                                        <motion.div
                                            key={biomarker.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="glass-sm p-4 rounded-lg"
                                        >
                                            {/* Biomarker Name & Status */}
                                            <div className="flex items-center justify-between mb-3">
                                                <div className="flex items-center gap-2">
                                                    <Activity className="w-4 h-4 text-primary" />
                                                    <h4 className="text-white font-medium">{biomarker.name}</h4>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(biomarker)}`}>
                                                    {getStatusLabel(biomarker)}
                                                </span>
                                            </div>

                                            {/* Value Input */}
                                            <div className="mb-2">
                                                <label className="block text-sm text-gray-400 mb-1">
                                                    Current Value
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={editedValues[biomarker.id] || biomarker.value}
                                                        onChange={(e) => handleValueChange(biomarker.id, e.target.value)}
                                                        step="0.1"
                                                        className="flex-1 px-4 py-2 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                                    />
                                                    <span className="text-gray-400 text-sm min-w-[60px]">{biomarker.unit}</span>
                                                </div>
                                            </div>

                                            {/* Normal Range */}
                                            <div className="text-xs text-gray-500">
                                                Normal Range: {biomarker.normalMin} - {biomarker.normalMax} {biomarker.unit}
                                            </div>

                                            {/* Measured Date */}
                                            <div className="text-xs text-gray-600 mt-1">
                                                Measured: {new Date(biomarker.measuredAt).toLocaleDateString()}
                                            </div>
                                        </motion.div>
                                    ))
                                )}
                            </div>

                            {/* Actions */}
                            {biomarkers.length > 0 && (
                                <div className="flex gap-3 pt-6 mt-6 border-t border-white/10">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={onClose}
                                        className="flex-1"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={handleSave}
                                        className="flex-1"
                                    >
                                        Save Changes
                                    </Button>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
