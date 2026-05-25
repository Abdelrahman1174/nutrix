import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Ban, CheckCircle, XCircle, RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import { fetchUsersApi, updateUserStatusApi } from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';

const CONDITION_COLORS = {
    active:    { bg: 'bg-green-500/15',  text: 'text-green-400',  dot: 'bg-green-400'  },
    suspended: { bg: 'bg-red-500/15',    text: 'text-red-400',    dot: 'bg-red-400'    },
};

const ACTIVITY_SHORT = {
    sedentary:   'Sedentary',
    light:       'Light',
    moderate:    'Moderate',
    active:      'Active',
    very_active: 'Very Active',
};

export default function UserManagement() {
    const { currentUser } = useAuth();
    const [users, setUsers]               = useState([]);
    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState(null);
    const [searchQuery, setSearchQuery]   = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [toggling, setToggling]         = useState(null); // userId being toggled

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        setLoading(true);
        setError(null);
        const result = await fetchUsersApi();
        if (result.error) {
            setError(result.error);
        } else {
            setUsers(result.users);
        }
        setLoading(false);
    };

    const handleToggleStatus = async (user) => {
        const newStatus = user.status === 'active' ? 'suspended' : 'active';
        setToggling(user.id);
        const result = await updateUserStatusApi(user.id, newStatus, currentUser?.email || '');
        if (result.success) {
            setUsers(prev => prev.map(u => u.id === user.id ? { ...u, status: newStatus } : u));
        } else {
            setError(result.message || 'Failed to update status');
        }
        setToggling(null);
    };

    const filtered = users.filter(u => {
        const q = searchQuery.toLowerCase();
        const matchesSearch = !q ||
            u.name.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q);
        const matchesStatus = statusFilter === 'all' || u.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const activeCount    = users.filter(u => u.status === 'active').length;
    const suspendedCount = users.filter(u => u.status === 'suspended').length;

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">User Management</h1>
                            <p className="text-gray-400">Manage user accounts from Supabase</p>
                        </div>
                    </div>
                    <Button variant="outline" onClick={loadUsers} disabled={loading} className="flex items-center gap-2">
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </Button>
                </motion.div>

                {/* Stats */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { label: 'Total Users',  value: users.length,    color: 'text-primary' },
                            { label: 'Active',       value: activeCount,     color: 'text-green-400' },
                            { label: 'Suspended',    value: suspendedCount,  color: 'text-red-400' },
                        ].map(({ label, value, color }) => (
                            <Card key={label} className="text-center py-4">
                                <p className={`text-3xl font-bold ${color}`}>{loading ? '—' : value}</p>
                                <p className="text-sm text-gray-400 mt-1">{label}</p>
                            </Card>
                        ))}
                    </div>
                </motion.div>

                {/* Filters */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                    <Card>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email…"
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth min-w-[180px]"
                            >
                                <option value="all">All Users</option>
                                <option value="active">Active Only</option>
                                <option value="suspended">Suspended Only</option>
                            </select>
                        </div>
                    </Card>
                </motion.div>

                {/* Error banner */}
                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="font-medium">Could not load users</p>
                            <p className="text-xs mt-1 text-red-300">{error}</p>
                            {error.toLowerCase().includes('policy') || error.toLowerCase().includes('permission') ? (
                                <p className="text-xs mt-2 text-yellow-400">
                                    Run <code className="font-mono bg-black/30 px-1 rounded">supabase_admin_users_policy.sql</code> in the Supabase SQL editor to enable admin access.
                                </p>
                            ) : null}
                        </div>
                    </div>
                )}

                {/* Table */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                    <Card>
                        {loading ? (
                            <div className="flex flex-col items-center py-16 gap-3">
                                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                                <p className="text-gray-400">Loading users from Supabase…</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-white/10">
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">User</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Status</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Body</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Activity</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">TDEE</th>
                                            <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Joined</th>
                                            <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.length === 0 ? (
                                            <tr>
                                                <td colSpan="7" className="text-center py-16 text-gray-500">
                                                    {users.length === 0 ? 'No users found in Supabase' : 'No users match your filter'}
                                                </td>
                                            </tr>
                                        ) : (
                                            filtered.map((user, index) => {
                                                const colors = CONDITION_COLORS[user.status] || CONDITION_COLORS.active;
                                                return (
                                                    <motion.tr
                                                        key={user.id}
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        transition={{ delay: index * 0.04 }}
                                                        className="border-b border-white/5 hover:bg-white/5 transition-smooth"
                                                    >
                                                        {/* User */}
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-9 h-9 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-sm font-bold text-primary">
                                                                        {(user.name || user.email || '?')[0].toUpperCase()}
                                                                    </span>
                                                                </div>
                                                                <div>
                                                                    <p className="text-white font-medium text-sm">
                                                                        {user.name || <span className="text-gray-500 italic">No name</span>}
                                                                    </p>
                                                                    <p className="text-gray-400 text-xs">{user.email}</p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        {/* Status */}
                                                        <td className="py-4 px-4">
                                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${colors.bg} ${colors.text}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full ${colors.dot}`} />
                                                                {user.status === 'active' ? 'Active' : 'Suspended'}
                                                            </span>
                                                        </td>

                                                        {/* Body */}
                                                        <td className="py-4 px-4 text-gray-300 text-sm">
                                                            {user.age || user.weight ? (
                                                                <span>
                                                                    {user.age ? `${user.age}y` : '—'}
                                                                    {user.weight ? ` · ${user.weight}kg` : ''}
                                                                    {user.height ? ` · ${user.height}cm` : ''}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-600 italic text-xs">No profile</span>
                                                            )}
                                                        </td>

                                                        {/* Activity */}
                                                        <td className="py-4 px-4">
                                                            {user.activityLevel ? (
                                                                <span className="text-xs text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                                                    {ACTIVITY_SHORT[user.activityLevel] ?? user.activityLevel}
                                                                </span>
                                                            ) : (
                                                                <span className="text-gray-600 text-xs italic">—</span>
                                                            )}
                                                        </td>

                                                        {/* TDEE */}
                                                        <td className="py-4 px-4 text-gray-300 text-sm">
                                                            {user.tdee ? `${Math.round(user.tdee)} kcal` : <span className="text-gray-600 italic text-xs">—</span>}
                                                        </td>

                                                        {/* Joined */}
                                                        <td className="py-4 px-4 text-gray-400 text-xs">
                                                            {user.createdAt
                                                                ? new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                : '—'}
                                                        </td>

                                                        {/* Actions */}
                                                        <td className="py-4 px-4">
                                                            <div className="flex items-center justify-end">
                                                                <button
                                                                    onClick={() => handleToggleStatus(user)}
                                                                    disabled={toggling === user.id}
                                                                    title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
                                                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-smooth disabled:opacity-50 ${
                                                                        user.status === 'active'
                                                                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                                                                            : 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                                                                    }`}
                                                                >
                                                                    {toggling === user.id ? (
                                                                        <Loader2 className="w-3 h-3 animate-spin" />
                                                                    ) : user.status === 'active' ? (
                                                                        <><Ban className="w-3 h-3" /> Suspend</>
                                                                    ) : (
                                                                        <><CheckCircle className="w-3 h-3" /> Activate</>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </Card>
                </motion.div>

                {/* Footer note */}
                {!loading && users.length === 0 && !error && (
                    <p className="text-center text-xs text-gray-600">
                        No users returned. Make sure you ran <code className="font-mono bg-black/30 px-1 rounded">supabase_admin_users_policy.sql</code> to grant admin read access.
                    </p>
                )}
            </div>
        </div>
    );
}
