/**
 * @typedef {Object} FoodSuitability
 * @property {string} id - Unique suitability record ID
 * @property {string} foodId - Food item ID
 * @property {string} conditionId - Condition ID (anemia, diabetes, hypertension, cholesterol)
 * @property {boolean} isSuitable - Whether the food is suitable for this condition
 * @property {string} notes - Optional clinical notes
 * @property {string} lastUpdatedBy - Admin ID who made the last update
 * @property {Date} updatedAt - Last update timestamp
 */

/**
 * Create a new food suitability record
 * @param {Partial<FoodSuitability>} data - Suitability data
 * @returns {FoodSuitability}
 */
export function createFoodSuitability(data = {}) {
    return {
        id: data.id || crypto.randomUUID(),
        foodId: data.foodId || '',
        conditionId: data.conditionId || '',
        isSuitable: data.isSuitable !== undefined ? data.isSuitable : true,
        notes: data.notes || '',
        lastUpdatedBy: data.lastUpdatedBy || 'system',
        updatedAt: data.updatedAt || new Date()
    };
}

/**
 * Health condition IDs
 */
export const CONDITION_IDS = {
    ANEMIA: 'anemia',
    DIABETES: 'diabetes',
    HYPERTENSION: 'hypertension',
    CHOLESTEROL: 'cholesterol'
};

/**
 * Condition labels
 */
export const CONDITION_LABELS = {
    anemia: 'Anemia',
    diabetes: 'Diabetes',
    hypertension: 'Hypertension',
    cholesterol: 'High Cholesterol'
};
