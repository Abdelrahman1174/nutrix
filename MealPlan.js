/**
 * @typedef {Object} Meal
 * @property {string} name - Meal name (Breakfast/Lunch/Dinner)
 * @property {string[]} foods - List of food items
 * @property {number} calories - Total calories
 * @property {number} carbs - Carbohydrates in grams
 * @property {number} fats - Fats in grams
 * @property {number} protein - Protein in grams
 */

/**
 * @typedef {Object} MealPlan
 * @property {string} id - Unique plan identifier
 * @property {string} userId - User who owns this plan
 * @property {Meal} breakfast - Breakfast meal
 * @property {Meal} lunch - Lunch meal
 * @property {Meal} dinner - Dinner meal
 * @property {number} totalCalories - Sum of all meals
 * @property {number} totalCarbs - Sum of carbs
 * @property {number} totalFats - Sum of fats
 * @property {number} totalProtein - Sum of protein
 * @property {Date} generatedAt - Plan generation timestamp
 */

/**
 * Create a new meal object
 * @param {Partial<Meal>} data - Meal data
 * @returns {Meal}
 */
export function createMeal(data = {}) {
    return {
        name: data.name || '',
        foods: data.foods || [],
        calories: data.calories || 0,
        carbs: data.carbs || 0,
        fats: data.fats || 0,
        protein: data.protein || 0
    };
}

/**
 * Create a new meal plan object
 * @param {Partial<MealPlan>} data - Meal plan data
 * @returns {MealPlan}
 */
export function createMealPlan(data = {}) {
    const breakfast = createMeal(data.breakfast);
    const lunch = createMeal(data.lunch);
    const dinner = createMeal(data.dinner);

    return {
        id: data.id || crypto.randomUUID(),
        userId: data.userId || '',
        breakfast,
        lunch,
        dinner,
        totalCalories: breakfast.calories + lunch.calories + dinner.calories,
        totalCarbs: breakfast.carbs + lunch.carbs + dinner.carbs,
        totalFats: breakfast.fats + lunch.fats + dinner.fats,
        totalProtein: breakfast.protein + lunch.protein + dinner.protein,
        generatedAt: data.generatedAt || new Date()
    };
}
