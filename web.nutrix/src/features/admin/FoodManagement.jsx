import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ArrowLeft,
    Plus,
    Edit2,
    Trash2,
    Loader2
} from 'lucide-react';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Input from '../../components/Input';
import {
    searchFoods,
    createFood,
    updateFood,
    deleteFood
} from '../../controllers/adminController';

export default function FoodManagement() {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [foods, setFoods] = useState([]);
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingFood, setEditingFood] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Get admin
        const sessionAdmin = sessionStorage.getItem('nutrix_admin');
        const localAdmin = localStorage.getItem('nutrix_admin');
        const adminData = sessionAdmin || localAdmin;

        if (adminData) {
            setAdmin(JSON.parse(adminData));
        }

        // Load foods
        loadFoods();
    }, []);

    useEffect(() => {
        // Real-time search (FR-15)
        const results = searchFoods(searchQuery);
        setFilteredFoods(results);
    }, [searchQuery, foods]);

    const loadFoods = () => {
        const allFoods = searchFoods('');
        setFoods(allFoods);
        setFilteredFoods(allFoods);
    };

    const handleDelete = async (foodId) => {
        if (!confirm('Are you sure you want to delete this food item?')) {
            return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500));

        const result = deleteFood(foodId, admin?.email);

        if (result.success) {
            loadFoods();
        } else {
            alert(result.message);
        }

        setIsLoading(false);
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
                                <h1 className="text-xl font-bold text-white">Food Management</h1>
                                <p className="text-xs text-gray-400">
                                    Search and manage food database
                                </p>
                            </div>
                        </div>

                        <Button
                            variant="primary"
                            onClick={() => setShowAddModal(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Food
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
                            placeholder="Search foods by name, description, or category..."
                            className="w-full pl-12 pr-4 py-4 bg-surface border-2 border-surface-light rounded-lg
                text-white placeholder-gray-500
                focus:outline-none focus:border-primary transition-smooth"
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                        Found {filteredFoods.length} food{filteredFoods.length !== 1 ? 's' : ''}
                    </p>
                </Card>

                {/* Food Grid */}
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
                                                className="p-2 hover:bg-white/10 rounded-lg transition-smooth"
                                            >
                                                <Trash2 className="w-4 h-4 text-anemia" />
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

                {filteredFoods.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-400">No foods found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>

            {/* Edit Modal (simplified for now) */}
            {editingFood && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-6 z-50">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="max-w-2xl w-full"
                    >
                        <Card title="Edit Food" className="glass-orange">
                            <div className="space-y-4">
                                <p className="text-gray-400">Food: {editingFood.name}</p>
                                <p className="text-sm text-gray-500">
                                    Full editing UI would go here. For this demo, use the suitability matrix to configure food properties.
                                </p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setEditingFood(null)}
                                        className="flex-1"
                                    >
                                        Close
                                    </Button>
                                    <Button
                                        variant="primary"
                                        onClick={() => navigate('/admin/suitability')}
                                        className="flex-1"
                                    >
                                        Go to Suitability Matrix
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            )}
        </div>
    );
}
