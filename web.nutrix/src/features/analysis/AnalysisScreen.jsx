import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PDFUploader from './PDFUploader';
import BiomarkerTable from './BiomarkerTable';
import StatusIndicator from '../../components/StatusIndicator';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { extractBiomarkersFromPDF } from '../../services/geminiService';
import { predictCondition } from './ConditionPredictor';

export default function AnalysisScreen({ onAnalysisComplete }) {
    const [biomarkers, setBiomarkers] = useState([]);
    const [prediction, setPrediction] = useState(null);
    const [isExtracting, setIsExtracting] = useState(false);

    const handlePDFUpload = async (file) => {
        setIsExtracting(true);
        try {
            const extractedBiomarkers = await extractBiomarkersFromPDF(file);
            setBiomarkers(extractedBiomarkers);

            // Predict condition based on extracted biomarkers
            const conditionPrediction = predictCondition(extractedBiomarkers);
            setPrediction(conditionPrediction);
        } catch (error) {
            console.error('Error extracting biomarkers:', error);
            throw error;
        } finally {
            setIsExtracting(false);
        }
    };

    const handleBiomarkersChange = (updatedBiomarkers) => {
        setBiomarkers(updatedBiomarkers);

        // Recalculate prediction when biomarkers change
        const conditionPrediction = predictCondition(updatedBiomarkers);
        setPrediction(conditionPrediction);
    };

    const handleProceedToMealPlan = () => {
        if (onAnalysisComplete && biomarkers.length > 0 && prediction) {
            onAnalysisComplete({
                biomarkers,
                prediction
            });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-background via-surface to-background p-6">
            <div className="max-w-7xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold text-gradient mb-2">Medical Analysis</h1>
                    <p className="text-gray-400">Upload your medical report to analyze biomarkers and health status</p>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: PDF Upload and Biomarkers */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                        >
                            <PDFUploader onUploadComplete={handlePDFUpload} />
                        </motion.div>

                        <AnimatePresence>
                            {biomarkers.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: 0.2 }}
                                >
                                    <BiomarkerTable
                                        biomarkers={biomarkers}
                                        onChange={handleBiomarkersChange}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Status & Prediction */}
                    <div className="lg:col-span-1">
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3 }}
                            className="sticky top-6 space-y-6"
                        >
                            {prediction ? (
                                <>
                                    <StatusIndicator
                                        condition={prediction.condition}
                                        showPulse={true}
                                    />

                                    <Card title="Analysis Details" variant="orange">
                                        <div className="space-y-4">
                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Confidence Level</h4>
                                                <div className="flex items-center gap-3">
                                                    <div className="flex-1 bg-surface rounded-full h-2">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${prediction.confidence}%` }}
                                                            transition={{ duration: 0.5, ease: 'easeOut' }}
                                                            className="gradient-primary h-full rounded-full"
                                                        />
                                                    </div>
                                                    <span className="text-primary font-bold">{prediction.confidence}%</span>
                                                </div>
                                            </div>

                                            <div>
                                                <h4 className="text-sm font-medium text-gray-400 mb-2">Key Indicators</h4>
                                                <ul className="space-y-2">
                                                    {prediction.reasons.map((reason, index) => (
                                                        <motion.li
                                                            key={index}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.1 * index }}
                                                            className="flex items-start gap-2 text-sm text-gray-300"
                                                        >
                                                            <span className="text-primary mt-0.5">•</span>
                                                            <span>{reason}</span>
                                                        </motion.li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="pt-4 border-t border-surface-light">
                                                <Button
                                                    variant="primary"
                                                    onClick={handleProceedToMealPlan}
                                                    className="w-full"
                                                >
                                                    Generate Meal Plan →
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </>
                            ) : (
                                <Card title="Waiting for Analysis">
                                    <div className="text-center py-8">
                                        <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                        </svg>
                                        <p className="text-gray-400 mb-2">No analysis yet</p>
                                        <p className="text-sm text-gray-500">Upload a medical report to begin</p>
                                    </div>
                                </Card>
                            )}
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
