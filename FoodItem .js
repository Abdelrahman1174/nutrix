/**
 * @typedef {Object} FoodItem
 * @property {string} id - Unique food identifier
 * @property {string} name - Food name
 * @property {string} description - Food description
 * @property {string} category - Category (breakfast, lunch, dinner, snack)
 * @property {number} calories - Calories per 100g
 * @property {number} carbs - Carbohydrates in grams per 100g
 * @property {number} protein - Protein in grams per 100g
 * @property {number} fat - Fat in grams per 100g
 * @property {number} sodium - Sodium in mg per 100g
 * @property {number} sugar - Sugar in grams per 100g
 * @property {number} cholesterol - Cholesterol in mg per 100g
 * @property {number} iron - Iron in mg per 100g
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Create a new food item
 * @param {Partial<FoodItem>} data - Food item data
 * @returns {FoodItem}
 */
export function createFoodItem(data = {}) {
    return {
        id: data.id || crypto.randomUUID(),
        name: data.name || '',
        description: data.description || '',
        category: data.category || 'snack',
        calories: data.calories || 0,
        carbs: data.carbs || 0,
        protein: data.protein || 0,
        fat: data.fat || 0,
        sodium: data.sodium || 0,
        sugar: data.sugar || 0,
        cholesterol: data.cholesterol || 0,
        iron: data.iron || 0,
        createdAt: data.createdAt || new Date(),
        updatedAt: data.updatedAt || new Date()
    };
}

/**
 * Food categories
 */
export const FOOD_CATEGORIES = {
    BREAKFAST: 'breakfast',
    LUNCH: 'lunch',
    DINNER: 'dinner',
    SNACK: 'snack'
};

/**
 * Category labels
 */
export const CATEGORY_LABELS = {
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack'
};
