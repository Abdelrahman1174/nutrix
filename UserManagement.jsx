import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Edit, Ban, Trash2, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import UserProfileEditor from '../../components/UserProfileEditor';
import { getAllUsers, updateUserAccount, toggleUserStatus, deleteUserAccount } from '../../controllers/adminController';
import { showSuccess, showError } from '../../utils/toastUtils';
import { useAuth } from '../../contexts/AuthContext';

export default function UserManagement() {
    const { currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = () => {
        const allUsers = getAllUsers();
        setUsers(allUsers);
    };

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setIsEditorOpen(true);
    };

    const handleSaveUser = (user, updates) => {
        const result = updateUserAccount(user.id, updates, currentUser?.email || 'admin@nutrix.com');

        if (result.success) {
            showSuccess(result.message);
            loadUsers();
            setIsEditorOpen(false);
            setSelectedUser(null);
        } else {
            showError(result.message);
        }
    };

    const handleToggleStatus = (user) => {
        const result = toggleUserStatus(user.id, currentUser?.email || 'admin@nutrix.com');

        if (result.success) {
            showSuccess(result.message);
            loadUsers();
        } else {
            showError(result.message);
        }
    };

    const handleDeleteUser = (user) => {
        if (deleteConfirm === user.id) {
            const result = deleteUserAccount(user.id, currentUser?.email || 'admin@nutrix.com');

            if (result.success) {
                showSuccess(result.message);
                loadUsers();
                setDeleteConfirm(null);
            } else {
                showError(result.message);
            }
        } else {
            setDeleteConfirm(user.id);
            // Auto-cancel after 3 seconds
            setTimeout(() => setDeleteConfirm(null), 3000);
        }
    };

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus =
            statusFilter === 'all' || user.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                            <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">User Management</h1>
                            <p className="text-gray-400">Manage user accounts, profiles, and permissions</p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <Card className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-3 bg-surface rounded-lg text-white border border-white/10 focus:border-primary focus:outline-none transition-smooth min-w-[200px]"
                        >
                            <option value="all">All Users</option>
                            <option value="active">Active Only</option>
                            <option value="suspended">Suspended Only</option>
                        </select>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/10">
                        <div className="text-center">
                            <p className="text-2xl font-bold text-white">{users.length}</p>
                            <p className="text-sm text-gray-400">Total Users</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-fit">{users.filter(u => u.status === 'active').length}</p>
                            <p className="text-sm text-gray-400">Active</p>
                        </div>
                        <div className="text-center">
                            <p className="text-2xl font-bold text-anemia">{users.filter(u => u.status === 'suspended').length}</p>
                            <p className="text-sm text-gray-400">Suspended</p>
                        </div>
                    </div>
                </Card>

                {/* User Table */}
                <Card>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Name</th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Email</th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Status</th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Age</th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Weight</th>
                                    <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400">Created</th>
                                    <th className="text-right py-4 px-4 text-sm font-semibold text-gray-400">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="text-center py-12 text-gray-400">
                                            No users found
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user, index) => (
                                        <motion.tr
                                            key={user.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="border-b border-white/5 hover:bg-white/5 transition-smooth"
                                        >
                                            <td className="py-4 px-4">
                                                <p className="text-white font-medium">{user.name}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                <p className="text-gray-400 text-sm">{user.email}</p>
                                            </td>
                                            <td className="py-4 px-4">
                                                {user.status === 'active' ? (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-fit/20 text-fit text-xs font-medium">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-anemia/20 text-anemia text-xs font-medium">
                                                        <XCircle className="w-3 h-3" />
                                                        Suspended
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-4 px-4 text-gray-300">{user.age} yrs</td>
                                            <td className="py-4 px-4 text-gray-300">{user.weight} kg</td>
                                            <td className="py-4 px-4 text-gray-400 text-sm">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-4">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Edit */}
                                                    <button
                                                        onClick={() => handleEditUser(user)}
                                                        className="w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-smooth"
                                                        title="Edit user"
                                                    >
                                                        <Edit className="w-4 h-4 text-primary" />
                                                    </button>

                                                    {/* Suspend/Activate */}
                                                    <button
                                                        onClick={() => handleToggleStatus(user)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-smooth ${user.status === 'active'
                                                                ? 'bg-anemia/10 hover:bg-anemia/20'
                                                                : 'bg-fit/10 hover:bg-fit/20'
                                                            }`}
                                                        title={user.status === 'active' ? 'Suspend user' : 'Activate user'}
                                                    >
                                                        <Ban className={`w-4 h-4 ${user.status === 'active' ? 'text-anemia' : 'text-fit'}`} />
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDeleteUser(user)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-smooth ${deleteConfirm === user.id
                                                                ? 'bg-red-500/20 hover:bg-red-500/30'
                                                                : 'bg-red-500/10 hover:bg-red-500/20'
                                                            }`}
                                                        title={deleteConfirm === user.id ? 'Click again to confirm' : 'Delete user'}
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
            </div>

            {/* User Profile Editor */}
            <UserProfileEditor
                user={selectedUser}
                isOpen={isEditorOpen}
                onSave={handleSaveUser}
                onClose={() => {
                    setIsEditorOpen(false);
                    setSelectedUser(null);
                }}
            />
        </div>
    );
}
