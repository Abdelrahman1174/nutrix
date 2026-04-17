import React from 'react';
import { motion } from 'framer-motion';

/**
 * Visual health status indicator component
 * @param {Object} props
 * @param {'anemia' | 'diabetes' | 'hypertension' | 'cholesterol' | 'fit'} props.condition - Health condition
 * @param {boolean} props.showPulse - Show animated pulse effect
 * @param {string} props.className - Additional CSS classes
 */
export default function StatusIndicator({ condition, showPulse = true, className = '' }) {
    const configs = {
        anemia: {
            label: 'Anemia Risk',
            color: 'bg-anemia',
            textColor: 'text-anemia',
            icon: '🩸',
            description: 'Low hemoglobin levels detected'
        },
        diabetes: {
            label: 'Diabetes Risk',
            color: 'bg-diabetes',
            textColor: 'text-diabetes',
            icon: '🍬',
            description: 'Elevated blood glucose levels'
        },
        hypertension: {
            label: 'Hypertension Risk',
            color: 'bg-hypertension',
            textColor: 'text-hypertension',
            icon: '💓',
            description: 'High blood pressure detected'
        },
        cholesterol: {
            label: 'High Cholesterol',
            color: 'bg-cholesterol',
            textColor: 'text-cholesterol',
            icon: '⚠️',
            description: 'Elevated cholesterol levels'
        },
        fit: {
            label: 'Healthy',
            color: 'bg-fit',
            textColor: 'text-fit',
            icon: '✅',
            description: 'All biomarkers within normal range'
        }
    };

    const config = configs[condition] || configs.fit;

    return (
        <div className={`relative ${className}`}>
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-lg p-4 border-l-4"
                style={{ borderLeftColor: `var(--tw-${condition})` }}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <span className="text-3xl">{config.icon}</span>
                        {showPulse && condition !== 'fit' && (
                            <motion.div
                                className={`absolute inset-0 ${config.color} rounded-full opacity-20`}
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.2, 0, 0.2]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut'
                                }}
                            />
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-semibold ${config.textColor}`}>
                                {config.label}
                            </h4>
                            <span className={`w-2 h-2 ${config.color} rounded-full ${showPulse ? 'animate-pulse' : ''}`} />
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                            {config.description}
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
