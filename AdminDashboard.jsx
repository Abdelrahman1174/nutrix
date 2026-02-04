import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Database,
    AlertCircle,
    Thermometer,
    LogOut,
    Search,
    Grid,
    List,
    Clock
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { getFoodStats, getAuditLogs } from '../../controllers/adminController';

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [stats, setStats] = useState(null);
    const [auditLogs, setAuditLogs] = useState([]);

    useEffect(() => {
        // Get admin from storage
        const sessionAdmin = sessionStorage.getItem('nutrix_admin');
        const localAdmin = localStorage.getItem('nutrix_admin');
        const adminData = sessionAdmin || localAdmin;

        if (adminData) {
            setAdmin(JSON.parse(adminData));
        }

        // Load stats and audit logs
        setStats(getFoodStats());
        setAuditLogs(getAuditLogs(10));
    }, []);

    const handleLogout = () => {
        sessionStorage.removeItem('nutrix_admin');
        localStorage.removeItem('nutrix_admin');
        navigate('/admin/login');
    };

    const statCards = [
        {
            title: 'Total Foods',
            value: stats?.totalFoods || 0,
            icon: Database,
            color: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            title: 'Unlabeled Items',
            value: stats?.unlabeled || 0,
            icon: AlertCircle,
            color: 'text-hypertension',
            bgColor: 'bg-hypertension/10'
        },
        {
            title: 'Active Conditions',
            value: stats?.activeConditions || 0,
            icon: Thermometer,
            color: 'text-fit',
            bgColor: 'bg-fit/10'
        }
    ];

    return (
        <div className="min-h-screen bg-background">
            {/* Admin Navigation */}
            <nav className="glass sticky top-0 z-50 border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 gradient-primary rounded-lg flex items-center justify-center">
                                <Database className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">Admin Dashboard</h1>
                                <p className="text-xs text-gray-400">
                                    Welcome, {admin?.name || admin?.email}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/admin/foods')}
                            >
                                <Search className="w-4 h-4 mr-2" />
                                Food Management
                            </Button>
                            <Button
                                variant="outline"
                                onClick={() => navigate('/admin/suitability')}
                            >
                                <Grid className="w-4 h-4 mr-2" />
                                Suitability Matrix
                            </Button>
                            <Button
                                variant="secondary"
                                onClick={handleLogout}
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Logout
                            </Button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {statCards.map((stat, index) => (
                        <motion.div
                            key={stat.title}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                        >
                            <Card className="glass hover:glass-orange transition-smooth">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-gray-400 text-sm mb-1">{stat.title}</p>
                                        <p className="text-4xl font-bold text-white">{stat.value}</p>
                                    </div>
                                    <div className={`w-16 h-16 rounded-xl ${stat.bgColor} flex items-center justify-center`}>
                                        <stat.icon className={`w-8 h-8 ${stat.color}`} />
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Quick Actions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <Card title="Quick Actions" className="glass">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button
                                variant="primary"
                                onClick={() => navigate('/admin/foods')}
                                className="h-20"
                            >
                                <Database className="w-6 h-6 mr-3" />
                                <div className="text-left">
                                    <div className="font-semibold">Manage Foods</div>
                                    <div className="text-xs opacity-80">Add, edit, or delete food items</div>
                                </div>
                            </Button>

                            <Button
                                variant="outline"
                                onClick={() => navigate('/admin/suitability')}
                                className="h-20"
                            >
                                <Grid className="w-6 h-6 mr-3" />
                                <div className="text-left">
                                    <div className="font-semibold">Suitability Matrix</div>
                                    <div className="text-xs opacity-80">Configure food-condition mappings</div>
                                </div>
                            </Button>
                        </div>
                    </Card>
                </motion.div>

                {/* Recent Activity - Audit Log */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card
                        title="Recent Activity"
                        subtitle="Latest 10 admin actions"
                        className="glass"
                    >
                        <div className="space-y-2">
                            {auditLogs.length === 0 ? (
                                <p className="text-gray-400 text-center py-8">No recent activity</p>
                            ) : (
                                auditLogs.map((log, index) => (
                                    <motion.div
                                        key={log.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.5 + index * 0.05 }}
                                        className="glass-sm p-4 rounded-lg hover:bg-white/5 transition-smooth"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`
                            px-2 py-0.5 rounded text-xs font-medium
                            ${log.action === 'create' ? 'bg-fit/20 text-fit' : ''}
                            ${log.action === 'update' ? 'bg-primary/20 text-primary' : ''}
                            ${log.action === 'delete' ? 'bg-anemia/20 text-anemia' : ''}
                            ${log.action === 'login' ? 'bg-diabetes/20 text-diabetes' : ''}
                          `}>
                                                        {log.action.toUpperCase()}
                                                    </span>
                                                    <span className="text-gray-400 text-sm">
                                                        {log.entityType}
                                                    </span>
                                                </div>
                                                <p className="text-white text-sm">
                                                    {log.adminEmail}
                                                </p>
                                                {Object.keys(log.changes).length > 0 && (
                                                    <p className="text-gray-500 text-xs mt-1">
                                                        {JSON.stringify(log.changes)}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right">
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mb-1">
                                                    <Clock className="w-3 h-3" />
                                                    {new Date(log.timestamp).toLocaleTimeString()}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    Pred: {log.predictionTime}ms | Ext: {log.extractionTime}ms
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </Card>
                </motion.div>
            </div>
        </div>
    );
}
