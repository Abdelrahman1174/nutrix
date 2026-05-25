import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {
    searchFoodsApi,
    createFoodApi,
    updateFoodApi,
    deleteFoodApi
} from '../../services/adminService';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from 'react-i18next';

const EMPTY_FOOD = { name: '', category: 'vegetables', description: '', calories: 0, protein: 0, carbs: 0, fat: 0, sodium: 0, sugar: 0, cholesterol: 0, iron: 0 };
const CATEGORIES = ['vegetables', 'fruits', 'grains', 'protein', 'dairy', 'other'];

function FoodModal({ food, onClose, onSave, isSaving }) {
    const [form, setForm] = useState(food ? { ...food } : { ...EMPTY_FOOD });

    const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: field === 'name' || field === 'category' || field === 'description' ? e.target.value : parseFloat(e.target.value) || 0 }));

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl w-full my-4">
                <Card title={food ? 'Edit Food' : 'Add Food'} className="glass-orange">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <Input label="Name" value={form.name} onChange={set('name')} placeholder="e.g. Spinach" required />
                        </div>
                        <div>
                            <label className="block text-sm text-gray-400 mb-1">Category</label>
                            <select value={form.category} onChange={set('category')} className="w-full px-3 py-2 rounded-lg bg-surface border border-surface-light text-white focus:outline-none focus:border-primary">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                            </select>
                        </div>
                        <div>
                            <Input label="Description" value={form.description} onChange={set('description')} placeholder="Brief description" />
                        </div>
                        <Input label="Calories (per 100g)" type="number" value={form.calories} onChange={set('calories')} />
                        <Input label="Protein (g)" type="number" value={form.protein} onChange={set('protein')} />
                        <Input label="Carbs (g)" type="number" value={form.carbs} onChange={set('carbs')} />
                        <Input label="Fat (g)" type="number" value={form.fat} onChange={set('fat')} />
                        <Input label="Sodium (mg)" type="number" value={form.sodium} onChange={set('sodium')} />
                        <Input label="Sugar (g)" type="number" value={form.sugar} onChange={set('sugar')} />
                        <Input label="Cholesterol (mg)" type="number" value={form.cholesterol} onChange={set('cholesterol')} />
                        <Input label="Iron (mg)" type="number" value={form.iron} onChange={set('iron')} />
                    </div>
                    <div className="flex gap-3 mt-6">
                        <Button variant="outline" onClick={onClose} className="flex-1">Cancel</Button>
                        <Button variant="primary" loading={isSaving} onClick={() => onSave(form)} className="flex-1">
                            {food ? 'Save Changes' : 'Add Food'}
                        </Button>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

export default function FoodManagement() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { currentUser } = useAuth();
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Real-time search with debounce
        const timer = setTimeout(() => {
            loadFoods(searchQuery);
        }, 500);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    const loadFoods = async (query = '') => {
        try {
            setIsLoading(true);
            setError(null);
            const results = await searchFoodsApi(query);
            setFilteredFoods(results || []);
        } catch (err) {
            console.error('Failed to load foods', err);
            setError(t('error_loading_foods', 'Failed to load foods. Please try again.'));
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (foodId) => {
        if (!window.confirm(t('confirm_delete_food', 'Are you sure you want to delete this food item?'))) {
            return;
        }

        try {
            setIsDeleting(true);
            const result = await deleteFoodApi(foodId, currentUser?.email);

            if (result.success) {
                loadFoods(searchQuery);
            } else {
                alert(result.message || t('error_delete_food', 'Failed to delete food'));
            }
        } catch (err) {
            console.error('Error deleting food', err);
            alert(t('error_network', 'Network error occurred while deleting.'));
        } finally {
            setIsDeleting(false);
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
                                <h1 className="text-xl font-bold text-white">{t('food_management', 'Food Management')}</h1>
                                <p className="text-xs text-gray-400">
                                    {t('search_manage_food', 'Search and manage food database')}
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            {t('add_food', 'Add Food')}
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Search Bar (FR-15) */}
                <Card className="glass mb-6">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('search_food_placeholder', 'Search foods by name, description, or category...')}
                            className="w-full pl-12 pr-4 py-4 bg-surface border-2 border-surface-light rounded-lg
                text-white placeholder-gray-500
                focus:outline-none focus:border-primary transition-smooth"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        {t('found_foods', 'Found {{count}} foods', { count: filteredFoods.length })}
                    </p>
                </Card>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm flex items-center gap-3">
                        <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {isLoading && !error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
                        <p className="text-gray-400">{t('loading_foods', 'Loading foods...')}</p>
                    </div>
                ) : !error && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <AnimatePresence>
                        {filteredFoods.map((food, index) => (
                            <motion.div
                                key={food.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.02 }}
                            >
                                <Card className="glass hover:glass-orange transition-smooth h-full">
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="text-white font-semibold text-lg">{food.name}</h3>
                                            <p className="text-xs text-gray-400 capitalize">{food.category}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setEditingFood(food)}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-smooth"
                                            >
                                                <Edit2 className="w-4 h-4 text-primary" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(food.id)}
                                                disabled={isDeleting}
                                                className="p-2 hover:bg-white/10 rounded-lg transition-smooth disabled:opacity-50"
                                            >
                                                {isDeleting ? <Loader2 className="w-4 h-4 text-anemia animate-spin" /> : <Trash2 className="w-4 h-4 text-anemia" />}
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-gray-400 text-sm mb-4">{food.description}</p>

                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                        <div className="bg-surface-light rounded p-2">
                                            <p className="text-gray-500 text-xs">Calories</p>
                                            <p className="text-white font-semibold">{food.calories}</p>
                                        </div>
                                        <div className="bg-surface-light rounded p-2">
                                            <p className="text-gray-500 text-xs">Protein</p>
                                            <p className="text-white font-semibold">{food.protein}g</p>
                                        </div>
                                        <div className="bg-surface-light rounded p-2">
                                            <p className="text-gray-500 text-xs">Carbs</p>
                                            <p className="text-white font-semibold">{food.carbs}g</p>
                                        </div>
                                        <div className="bg-surface-light rounded p-2">
                                            <p className="text-gray-500 text-xs">Fat</p>
                                            <p className="text-white font-semibold">{food.fat}g</p>
                                        </div>
                                    </div>

                                    {/* Clinical indicators */}
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {food.sodium > 400 && (
                                            <span className="text-xs px-2 py-1 bg-hypertension/10 text-hypertension rounded">
                                                High Sodium
                                            </span>
                                        )}
                                        {food.sugar > 8 && (
                                            <span className="text-xs px-2 py-1 bg-diabetes/10 text-diabetes rounded">
                                                High Sugar
                                            </span>
                                        )}
                                        {food.cholesterol > 80 && (
                                            <span className="text-xs px-2 py-1 bg-cholesterol/10 text-cholesterol rounded">
                                                High Cholesterol
                                            </span>
                                        )}
                                        {food.iron > 2 && (
                                            <span className="text-xs px-2 py-1 bg-fit/10 text-fit rounded">
                                                High Iron
                                            </span>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
                )}

                {!isLoading && filteredFoods.length === 0 && !error && (
                    <div className="text-center py-12 text-gray-400">
                        <p>{t('no_foods_found', 'No foods found matching "{{query}}"', { query: searchQuery })}</p>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            {editingFood && (
                <FoodModal
                    food={editingFood}
                    onClose={() => setEditingFood(null)}
                    onSave={async (data) => {
                        setIsSaving(true);
                        const result = await updateFoodApi(editingFood.id, data);
                        setIsSaving(false);
                        if (result.success) { setEditingFood(null); loadFoods(searchQuery); }
                        else alert(result.message || 'Failed to update food');
                    }}
                    isSaving={isSaving}
                />
            )}

            {/* Add Modal */}
            {showAddModal && (
                <FoodModal
                    onClose={() => setShowAddModal(false)}
                    onSave={async (data) => {
                        setIsSaving(true);
                        const result = await createFoodApi(data);
                        setIsSaving(false);
                        if (result.success) { setShowAddModal(false); loadFoods(searchQuery); }
                        else alert(result.message || 'Failed to create food');
                    }}
                    isSaving={isSaving}
                />
            )}
        </div>
    );
}
