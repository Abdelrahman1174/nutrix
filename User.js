/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} email - User email address
 * @property {string} name - Full name
 * @property {'admin' | 'user'} role - User role (admin or regular user)
 * @property {'active' | 'suspended'} status - Account status
 * @property {number} age - Age in years
 * @property {string} gender - Gender (male/female/other)
 * @property {number} height - Height in cm
 * @property {number} weight - Weight in kg
 * @property {string} activityLevel - Activity level (sedentary/light/moderate/active/very_active)
 * @property {number} bmr - Basal Metabolic Rate (calculated)
 * @property {number} tdee - Total Daily Energy Expenditure (calculated)
 * @property {Date} createdAt - Account creation date
 */

/**
 * Activity level multipliers for TDEE calculation
 */
export const ACTIVITY_MULTIPLIERS = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9
};

/**
 * Activity level labels for display
 */
export const ACTIVITY_LABELS = {
    sedentary: 'Sedentary (little or no exercise)',
    light: 'Light (exercise 1-3 days/week)',
    moderate: 'Moderate (exercise 3-5 days/week)',
    active: 'Active (exercise 6-7 days/week)',
    very_active: 'Very Active (physical job or training twice per day)'
};

/**
 * Create a new user object
 * @param {Partial<User>} data - User data
 * @returns {User}
 */
export function createUser(data = {}) {
    return {
        id: data.id || '',
        email: data.email || '',
        name: data.name || '',
        role: data.role || 'user',
        status: data.status || 'active',
        age: data.age || 0,
        gender: data.gender || 'male',
        height: data.height || 0,
        weight: data.weight || 0,
        activityLevel: data.activityLevel || 'moderate',
        bmr: data.bmr || 0,
        tdee: data.tdee || 0,
        createdAt: data.createdAt || new Date()
    };
}
