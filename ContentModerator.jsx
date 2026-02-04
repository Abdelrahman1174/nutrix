import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Utensils, Trash2, Edit, Activity } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import MealPlanEditor from '../../components/MealPlanEditor';
import MedicalValueEditor from '../../components/MedicalValueEditor';
import { getAllMealPlans, updateMealPlanMacros, getAllMedicalReports, deleteMedicalReport, getAllUsers } from '../../controllers/adminController';
import { showSuccess, showError } from '../../utils/toastUtils';
import { useAuth } from '../../contexts/AuthContext';

export default function ContentModerator() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab] = useState('meal_plans');
    const [mealPlans, setMealPlans] = useState([]);
    const [medicalReports, setMedicalReports] = useState([]);
    const [users, setUsers] = useState([]);

    // Meal plan editor state
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [isPlanEditorOpen, setIsPlanEditorOpen] = useState(false);

    // Medical value editor state
    const [selectedReportId, setSelectedReportId] = useState(null);
    const [isValueEditorOpen, setIsValueEditorOpen] = useState(false);

    // Delete confirmation
    const [deleteConfirmPlan, setDeleteConfirmPlan] = useState(null);
    const [deleteConfirmReport, setDeleteConfirmReport] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = () => {
        setMealPlans(getAllMealPlans());
        setMedicalReports(getAllMedicalReports());
        setUsers(getAllUsers());
    };

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown User';
    };

    const handleEditPlan = (plan) => {
        setSelectedPlan(plan);
        setIsPlanEditorOpen(true);
    };

    const handleSavePlan = (planId, macros) => {
        const result = updateMealPlanMacros(planId, macros, currentUser?.email || 'admin@nutrix.com');

        if (result.success) {
            showSuccess(result.message);
            loadData();
            setIsPlanEditorOpen(false);
            setSelectedPlan(null);
        } else {
            showError(result.message);
        }
    };

    const handleEditReport = (reportId) => {
        setSelectedReportId(reportId);
        setIsValueEditorOpen(true);
    };

    const handleDeleteReport = (reportId) => {
        if (deleteConfirmReport === reportId) {
            const result = deleteMedicalReport(reportId, currentUser?.email || 'admin@nutrix.com');

            if (result.success) {
                showSuccess(result.message);
                loadData();
                setDeleteConfirmReport(null);
            } else {
                showError(result.message);
            }
        } else {
            setDeleteConfirmReport(reportId);
            setTimeout(() => setDeleteConfirmReport(null), 3000);
        }
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Content Moderator</h1>
                            <p className="text-gray-400">Manage meal plans and medical reports</p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <Card className="mb-6">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('meal_plans')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-smooth ${activeTab === 'meal_plans'
                                    ? 'bg-primary text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Utensils className="w-5 h-5" />
                            Meal Plans ({mealPlans.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('medical_reports')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-smooth ${activeTab === 'medical_reports'
                                    ? 'bg-primary text-white'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            <Activity className="w-5 h-5" />
                            Medical Reports ({medicalReports.length})
                        </button>
                    </div>
                </Card>

                {/* Meal Plans Tab */}
                {activeTab === 'meal_plans' && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">User</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Generated</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Calories</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Carbs</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Fats</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Protein</th>
                                        <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mealPlans.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12 text-gray-400">
                                                No meal plans found
                                            </td>
                                        </tr>
                                    ) : (
                                        mealPlans.map((plan, index) => (
                                            <motion.tr
                                                key={plan.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-b border-white/5 hover:bg-white/5 transition-smooth"
                                            >
                                                <td className="py-4 px-4 text-white">{getUserName(plan.userId)}</td>
                                                <td className="py-4 px-4 text-gray-400 text-sm">
                                                    {new Date(plan.generatedAt).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4 text-white font-medium">{plan.totalCalories} kcal</td>
                                                <td className="py-4 px-4 text-gray-300">{plan.totalCarbs}g</td>
                                                <td className="py-4 px-4 text-gray-300">{plan.totalFats}g</td>
                                                <td className="py-4 px-4 text-gray-300">{plan.totalProtein}g</td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditPlan(plan)}
                                                            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-smooth"
                                                            title="Edit meal plan"
                                                        >
                                                            <Edit className="w-4 h-4 text-primary" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}

                {/* Medical Reports Tab */}
                {activeTab === 'medical_reports' && (
                    <Card>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-white/10">
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">User</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Report Type</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Upload Date</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Report Date</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Biomarkers</th>
                                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Status</th>
                                        <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {medicalReports.length === 0 ? (
                                        <tr>
                                            <td colSpan="7" className="text-center py-12 text-gray-400">
                                                No medical reports found
                                            </td>
                                        </tr>
                                    ) : (
                                        medicalReports.map((report, index) => (
                                            <motion.tr
                                                key={report.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="border-b border-white/5 hover:bg-white/5 transition-smooth"
                                            >
                                                <td className="py-4 px-4 text-white">{getUserName(report.userId)}</td>
                                                <td className="py-4 px-4 text-gray-300 capitalize">
                                                    {report.reportType.replace(/_/g, ' ')}
                                                </td>
                                                <td className="py-4 px-4 text-gray-400 text-sm">
                                                    {new Date(report.uploadDate).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4 text-gray-400 text-sm">
                                                    {new Date(report.reportDate).toLocaleDateString()}
                                                </td>
                                                <td className="py-4 px-4 text-white">{report.extractedValues.length}</td>
                                                <td className="py-4 px-4">
                                                    {report.status === 'processed' ? (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-fit/20 text-fit text-xs font-medium">
                                                            Processed
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/20 text-primary text-xs font-medium">
                                                            {report.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-4">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditReport(report.id)}
                                                            className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-smooth"
                                                            title="Edit biomarkers"
                                                        >
                                                            <Edit className="w-4 h-4 text-primary" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteReport(report.id)}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-smooth ${deleteConfirmReport === report.id
                                                                    ? 'bg-red-500/20 hover:bg-red-500/30'
                                                                    : 'bg-red-500/10 hover:bg-red-500/20'
                                                                }`}
                                                            title={deleteConfirmReport === report.id ? 'Click again to confirm' : 'Delete report'}
                                                        >
                                                            <Trash2 className="w-4 h-4 text-red-400" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                )}
            </div>

            {/* Meal Plan Editor */}
            <MealPlanEditor
                mealPlan={selectedPlan}
                isOpen={isPlanEditorOpen}
                onSave={handleSavePlan}
                onClose={() => {
                    setIsPlanEditorOpen(false);
                    setSelectedPlan(null);
                }}
            />

            {/* Medical Value Editor */}
            <MedicalValueEditor
                reportId={selectedReportId}
                isOpen={isValueEditorOpen}
                adminEmail={currentUser?.email || 'admin@nutrix.com'}
                onClose={() => {
                    setIsValueEditorOpen(false);
                    setSelectedReportId(null);
                    loadData(); // Reload to show updated values
                }}
            />
        </div>
    );
}
