import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Utensils, Trash2, Activity, RefreshCw,
    AlertTriangle, Loader2, ChevronDown, ChevronUp, X
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import {
    fetchAllMealPlansApi,
    fetchAllMedicalReportsApi,
    updateMealPlanMacrosApi,
    deleteMedicalReportApi,
    fetchUsersApi,
} from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const CONDITION_COLORS = {
    anemia:       'bg-red-500/15 text-red-400',
    diabetes:     'bg-yellow-500/15 text-yellow-400',
    hypertension: 'bg-orange-500/15 text-orange-400',
    cholesterol:  'bg-purple-500/15 text-purple-400',
    fit:          'bg-green-500/15 text-green-400',
};

function ConditionBadge({ condition }) {
    if (!condition) return <span className="text-gray-600 text-xs italic">—</span>;
    const label = condition.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    const cls   = CONDITION_COLORS[condition.toLowerCase()] ?? 'bg-primary/15 text-primary';
    return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
            {label}
        </span>
    );
}

function BiomarkerRow({ label, value, unit }) {
    if (value == null) return null;
    return (
        <div className="flex justify-between text-xs py-0.5">
            <span className="text-gray-400">{label}</span>
            <span className="text-white font-medium">{value} <span className="text-gray-500">{unit}</span></span>
        </div>
    );
}

export default function ContentModerator() {
    const { currentUser } = useAuth();
    const [activeTab, setActiveTab]     = useState('meal_plans');
    const [plans, setPlans]             = useState([]);
    const [reports, setReports]         = useState([]);
    const [userMap, setUserMap]         = useState({});   // userId → { name, email }
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [expandedRow, setExpandedRow] = useState(null);
    const [deleting, setDeleting]       = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const [editingPlan, setEditingPlan] = useState(null); // { id, macros }
    const [saving, setSaving]           = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);
        setError(null);

        const [plansResult, reportsResult, usersResult] = await Promise.all([
            fetchAllMealPlansApi(),
            fetchAllMedicalReportsApi(),
            fetchUsersApi(),
        ]);

        if (plansResult.error || reportsResult.error || usersResult.error) {
            setError(plansResult.error || reportsResult.error || usersResult.error);
        }

        setPlans(plansResult.plans);
        setReports(reportsResult.reports);

        const map = {};
        (usersResult.users || []).forEach(u => {
            map[u.id] = { name: u.name, email: u.email };
        });
        setUserMap(map);
        setLoading(false);
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const userName = (userId) => {
        const u = userMap[userId];
        if (!u) return <span className="text-gray-500 italic text-xs">Unknown</span>;
        return u.name || u.email || userId.slice(0, 8) + '…';
    };

    // ── Meal plan macro edit ──────────────────────────────────────────────
    const startEdit = (plan) => {
        setEditingPlan({
            id:   plan.id,
            totalCalories: plan.totalCalories,
            totalProtein:  plan.totalProtein,
            totalCarbs:    plan.totalCarbs,
            totalFats:     plan.totalFats,
        });
    };

    const handleMacroChange = (field) => (e) => {
        setEditingPlan(prev => ({ ...prev, [field]: parseFloat(e.target.value) || 0 }));
    };

    const saveMacros = async () => {
        if (!editingPlan) return;
        setSaving(true);
        const { id, ...macros } = editingPlan;
        const result = await updateMealPlanMacrosApi(id, macros, currentUser?.email || '');
        if (result.success) {
            setPlans(prev => prev.map(p => p.id === id ? { ...p, ...macros } : p));
            setEditingPlan(null);
        } else {
            setError(result.message);
        }
        setSaving(false);
    };

    // ── Report delete ─────────────────────────────────────────────────────
    const handleDeleteReport = async (reportId) => {
        if (deleteConfirm !== reportId) {
            setDeleteConfirm(reportId);
            setTimeout(() => setDeleteConfirm(null), 3000);
            return;
        }
        setDeleting(reportId);
        const result = await deleteMedicalReportApi(reportId, currentUser?.email || '');
        if (result.success) {
            setReports(prev => prev.filter(r => r.id !== reportId));
            setDeleteConfirm(null);
        } else {
            setError(result.message);
        }
        setDeleting(null);
    };

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">Content Moderator</h1>
                            <p className="text-gray-400">Real-time data from Supabase</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={loadData} disabled={loading} className="flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </motion.div>

                {/* Error banner */}
                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-sm">
                        <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-red-400 font-medium">Could not load data</p>
                            <p className="text-xs text-red-300 mt-1">{error}</p>
                            {(error.toLowerCase().includes('policy') || error.toLowerCase().includes('permission') || error.toLowerCase().includes('rls')) && (
                                <p className="text-xs text-yellow-400 mt-2">
                                    Run <code className="font-mono bg-black/30 px-1 rounded">supabase_admin_users_policy.sql</code> in the Supabase SQL editor to grant admin access.
                                </p>
                            )}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <Card>
                    <div className="flex gap-3">
                        {[
                            { id: 'meal_plans',      label: 'Meal Plans',       count: plans.length,   icon: Utensils  },
                            { id: 'medical_reports', label: 'Medical Reports',  count: reports.length, icon: Activity  },
                        ].map(({ id, label, count, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => setActiveTab(id)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-smooth text-sm ${
                                    activeTab === id ? 'bg-primary text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                <Icon className="w-4 h-4" />
                                {label}
                                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === id ? 'bg-black/20' : 'bg-white/10'}`}>
                                    {loading ? '…' : count}
                                </span>
                            </button>
                        ))}
                    </div>
                </Card>

                {/* Loading */}
                {loading && (
                    <Card>
                        <div className="flex flex-col items-center py-16 gap-3">
                            <Loader2 className="w-8 h-8 text-primary animate-spin" />
                            <p className="text-gray-400">Loading from Supabase…</p>
                        </div>
                    </Card>
                )}

                {/* ── Meal Plans ── */}
                {!loading && activeTab === 'meal_plans' && (
                    <AnimatePresence mode="wait">
                        <motion.div key="plans" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Card>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Calories</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Protein</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Carbs</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Fats</th>
                                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {plans.length === 0 ? (
                                                <tr><td colSpan="7" className="text-center py-16 text-gray-500">No meal plans in Supabase yet</td></tr>
                                            ) : plans.map((plan, i) => (
                                                <React.Fragment key={plan.id}>
                                                    <motion.tr
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.03 }}
                                                        className="border-b border-white/5 hover:bg-white/5 transition-smooth"
                                                    >
                                                        <td className="py-3 px-4 text-white text-sm">{userName(plan.userId)}</td>
                                                        <td className="py-3 px-4 text-gray-400 text-xs">
                                                            {plan.planDate || (plan.generatedAt ? new Date(plan.generatedAt).toLocaleDateString() : '—')}
                                                        </td>
                                                        <td className="py-3 px-4 text-primary font-semibold text-sm">{plan.totalCalories} kcal</td>
                                                        <td className="py-3 px-4 text-gray-300 text-sm">{plan.totalProtein}g</td>
                                                        <td className="py-3 px-4 text-gray-300 text-sm">{plan.totalCarbs}g</td>
                                                        <td className="py-3 px-4 text-gray-300 text-sm">{plan.totalFats}g</td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center justify-end gap-2">
                                                                <button
                                                                    onClick={() => startEdit(plan)}
                                                                    className="text-xs px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-smooth"
                                                                >
                                                                    Edit Macros
                                                                </button>
                                                                <button
                                                                    onClick={() => setExpandedRow(expandedRow === plan.id ? null : plan.id)}
                                                                    className="w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-smooth"
                                                                    title="View meals"
                                                                >
                                                                    {expandedRow === plan.id
                                                                        ? <ChevronUp className="w-3.5 h-3.5 text-gray-400" />
                                                                        : <ChevronDown className="w-3.5 h-3.5 text-gray-400" />}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>

                                                    {/* Expanded meal breakdown */}
                                                    {expandedRow === plan.id && plan.meals.length > 0 && (
                                                        <tr className="bg-white/2">
                                                            <td colSpan="7" className="px-4 py-3">
                                                                <div className="grid grid-cols-3 gap-3">
                                                                    {plan.meals.map(m => (
                                                                        <div key={m.meal_type} className="glass-orange rounded-lg p-3">
                                                                            <p className="text-xs font-semibold text-primary capitalize mb-2">{m.meal_type}</p>
                                                                            <div className="space-y-1 text-xs">
                                                                                <div className="flex justify-between"><span className="text-gray-400">Cal</span><span className="text-white">{m.meal_calories ?? '—'} kcal</span></div>
                                                                                <div className="flex justify-between"><span className="text-gray-400">Protein</span><span className="text-white">{m.meal_protein ?? '—'}g</span></div>
                                                                                <div className="flex justify-between"><span className="text-gray-400">Carbs</span><span className="text-white">{m.meal_carbs ?? '—'}g</span></div>
                                                                                <div className="flex justify-between"><span className="text-gray-400">Fats</span><span className="text-white">{m.meal_fats ?? '—'}g</span></div>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* ── Medical Reports ── */}
                {!loading && activeTab === 'medical_reports' && (
                    <AnimatePresence mode="wait">
                        <motion.div key="reports" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <Card>
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead>
                                            <tr className="border-b border-white/10">
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">File</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Condition</th>
                                                <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Key Values</th>
                                                <th className="text-right py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reports.length === 0 ? (
                                                <tr><td colSpan="6" className="text-center py-16 text-gray-500">No medical reports in Supabase yet</td></tr>
                                            ) : reports.map((report, i) => (
                                                <React.Fragment key={report.id}>
                                                    <motion.tr
                                                        initial={{ opacity: 0, y: 8 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: i * 0.03 }}
                                                        className="border-b border-white/5 hover:bg-white/5 transition-smooth"
                                                    >
                                                        <td className="py-3 px-4 text-white text-sm">{userName(report.userId)}</td>
                                                        <td className="py-3 px-4 text-gray-400 text-xs max-w-[160px] truncate" title={report.fileName}>
                                                            {report.fileName || '—'}
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                                                report.status === 'processed' ? 'bg-green-500/15 text-green-400' :
                                                                report.status === 'failed'    ? 'bg-red-500/15 text-red-400' :
                                                                'bg-yellow-500/15 text-yellow-400'
                                                            }`}>
                                                                {report.status || 'unknown'}
                                                            </span>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <ConditionBadge condition={report.condition} />
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <button
                                                                onClick={() => setExpandedRow(expandedRow === report.id ? null : report.id)}
                                                                className="text-xs text-primary hover:underline flex items-center gap-1"
                                                            >
                                                                View biomarkers
                                                                {expandedRow === report.id ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                            </button>
                                                        </td>
                                                        <td className="py-3 px-4">
                                                            <div className="flex items-center justify-end">
                                                                <button
                                                                    onClick={() => handleDeleteReport(report.id)}
                                                                    disabled={deleting === report.id}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth disabled:opacity-50 ${
                                                                        deleteConfirm === report.id
                                                                            ? 'bg-red-500/30 text-red-300'
                                                                            : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                                    }`}
                                                                >
                                                                    {deleting === report.id
                                                                        ? <Loader2 className="w-3 h-3 animate-spin" />
                                                                        : <Trash2 className="w-3 h-3" />}
                                                                    {deleteConfirm === report.id ? 'Confirm?' : 'Delete'}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>

                                                    {/* Expanded biomarkers */}
                                                    {expandedRow === report.id && (
                                                        <tr className="bg-white/2">
                                                            <td colSpan="6" className="px-4 py-3">
                                                                <div className="glass-orange rounded-lg p-4 max-w-sm">
                                                                    <p className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">Biomarkers</p>
                                                                    <BiomarkerRow label="Glucose"       value={report.biomarkers.glucose}       unit="mg/dL" />
                                                                    <BiomarkerRow label="HbA1c"         value={report.biomarkers.hba1c}         unit="%" />
                                                                    <BiomarkerRow label="Systolic BP"   value={report.biomarkers.systolicBP}    unit="mmHg" />
                                                                    <BiomarkerRow label="Diastolic BP"  value={report.biomarkers.diastolicBP}   unit="mmHg" />
                                                                    <BiomarkerRow label="LDL"           value={report.biomarkers.ldl}           unit="mg/dL" />
                                                                    <BiomarkerRow label="HDL"           value={report.biomarkers.hdl}           unit="mg/dL" />
                                                                    <BiomarkerRow label="Triglycerides" value={report.biomarkers.triglycerides} unit="mg/dL" />
                                                                    <BiomarkerRow label="Haemoglobin"   value={report.biomarkers.haemoglobin}   unit="g/dL" />
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>

            {/* Edit Macros Modal */}
            <AnimatePresence>
                {editingPlan && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                        onClick={() => setEditingPlan(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
                            className="w-full max-w-sm glass rounded-2xl p-6 space-y-4"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">Edit Macros</h3>
                                <button onClick={() => setEditingPlan(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                                    <X className="w-4 h-4 text-gray-400" />
                                </button>
                            </div>
                            {[
                                { key: 'totalCalories', label: 'Calories (kcal)' },
                                { key: 'totalProtein',  label: 'Protein (g)' },
                                { key: 'totalCarbs',    label: 'Carbs (g)' },
                                { key: 'totalFats',     label: 'Fats (g)' },
                            ].map(({ key, label }) => (
                                <div key={key}>
                                    <label className="block text-xs text-gray-400 mb-1">{label}</label>
                                    <input
                                        type="number"
                                        value={editingPlan[key]}
                                        onChange={handleMacroChange(key)}
                                        className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-light text-white text-sm focus:outline-none focus:border-primary"
                                    />
                                </div>
                            ))}
                            <div className="flex gap-3 pt-2">
                                <Button variant="outline" onClick={() => setEditingPlan(null)} className="flex-1">Cancel</Button>
                                <Button variant="primary" loading={saving} onClick={saveMacros} className="flex-1">Save</Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
