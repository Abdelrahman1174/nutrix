import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../../components/Card';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { BIOMARKER_STATUS, COMMON_BIOMARKERS, createBiomarker } from '../../models/Biomarker';

export default function BiomarkerTable({ biomarkers, onChange }) {
    const [editingId, setEditingId] = useState(null);
    const [editValue, setEditValue] = useState('');

    const handleEdit = (biomarker) => {
        setEditingId(biomarker.id);
        setEditValue(biomarker.value.toString());
    };

    const handleSave = (biomarker) => {
        const newValue = parseFloat(editValue);
        if (!isNaN(newValue)) {
            const updatedBiomarkers = biomarkers.map(b => {
                if (b.id === biomarker.id) {
                    return createBiomarker({
                        ...b,
                        value: newValue
                    });
                }
                return b;
            });
            onChange(updatedBiomarkers);
        }
        setEditingId(null);
    };

    const handleCancel = () => {
        setEditingId(null);
        setEditValue('');
    };

    const handleRemove = (id) => {
        onChange(biomarkers.filter(b => b.id !== id));
    };

    const handleAdd = () => {
        const newBiomarker = createBiomarker({
            ...COMMON_BIOMARKERS.hemoglobin,
            value: 0
        });
        onChange([...biomarkers, newBiomarker]);
    };

    const getStatusColor = (status) => {
        switch (status) {
            case BIOMARKER_STATUS.NORMAL:
                return 'text-fit bg-fit/10';
            case BIOMARKER_STATUS.LOW:
                return 'text-anemia bg-anemia/10';
            case BIOMARKER_STATUS.HIGH:
                return 'text-cholesterol bg-cholesterol/10';
            default:
                return 'text-gray-400 bg-gray-400/10';
        }
    };

    return (
        <Card title="Biomarkers" subtitle="Review and edit extracted biomarker values">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-surface-light">
                            <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">Biomarker</th>
                            <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">Value</th>
                            <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">Unit</th>
                            <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">Normal Range</th>
                            <th className="text-left text-sm font-medium text-gray-400 pb-3 pr-4">Status</th>
                            <th className="text-left text-sm font-medium text-gray-400 pb-3">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence>
                            {biomarkers.map((biomarker, index) => (
                                <motion.tr
                                    key={biomarker.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="border-b border-surface-light/50 hover:bg-surface/50 transition-smooth"
                                >
                                    <td className="py-4 pr-4">
                                        <span className="text-white font-medium">{biomarker.name}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        {editingId === biomarker.id ? (
                                            <input
                                                type="number"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                className="w-24 px-2 py-1 rounded bg-surface border border-primary text-white text-sm input-focus"
                                                autoFocus
                                            />
                                        ) : (
                                            <span className="text-white">{biomarker.value}</span>
                                        )}
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-gray-400 text-sm">{biomarker.unit}</span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className="text-gray-400 text-sm">
                                            {biomarker.normalMin} - {biomarker.normalMax}
                                        </span>
                                    </td>
                                    <td className="py-4 pr-4">
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(biomarker.status)}`}>
                                            {biomarker.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex items-center gap-2">
                                            {editingId === biomarker.id ? (
                                                <>
                                                    <button
                                                        onClick={() => handleSave(biomarker)}
                                                        className="text-fit hover:text-fit/80 transition-smooth"
                                                        title="Save"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={handleCancel}
                                                        className="text-gray-400 hover:text-gray-300 transition-smooth"
                                                        title="Cancel"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                        </svg>
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => handleEdit(biomarker)}
                                                        className="text-primary hover:text-primary-light transition-smooth"
                                                        title="Edit"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                    </button>
                                                    <button
                                                        onClick={() => handleRemove(biomarker.id)}
                                                        className="text-red-400 hover:text-red-300 transition-smooth"
                                                        title="Remove"
                                                    >
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>

                {biomarkers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400 mb-4">No biomarkers available</p>
                        <p className="text-sm text-gray-500">Upload a medical report to extract biomarkers</p>
                    </div>
                )}
            </div>

            {biomarkers.length > 0 && (
                <div className="mt-4">
                    <Button variant="outline" onClick={handleAdd} className="w-full md:w-auto">
                        + Add Biomarker
                    </Button>
                </div>
            )}
        </Card>
    );
}
