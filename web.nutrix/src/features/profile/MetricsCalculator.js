/**
 * Health metrics calculator
 */

import { ACTIVITY_MULTIPLIERS } from '../../models/User.js';

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @param {number} age - Age in years
 * @param {string} gender - Gender (male/female)
 * @returns {number} BMR in calories/day
 */
export function calculateBMR(weight, height, age, gender) {
    // Mifflin-St Jeor Equation
    // Men: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) + 5
    // Women: BMR = (10 × weight in kg) + (6.25 × height in cm) - (5 × age in years) - 161

    const base = (10 * weight) + (6.25 * height) - (5 * age);
    const bmr = gender === 'male' ? base + 5 : base - 161;

    return Math.round(bmr);
}

/**
 * Calculate Total Daily Energy Expenditure
 * @param {number} bmr - Basal Metabolic Rate
 * @param {string} activityLevel - Activity level (sedentary/light/moderate/active/very_active)
 * @returns {number} TDEE in calories/day
 */
export function calculateTDEE(bmr, activityLevel) {
    const multiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.moderate;
    return Math.round(bmr * multiplier);
}

/**
 * Calculate Body Mass Index
 * @param {number} weight - Weight in kg
 * @param {number} height - Height in cm
 * @returns {number} BMI
 */
export function calculateBMI(weight, height) {
    // BMI = weight (kg) / (height (m))^2
    const heightInMeters = height / 100;
    return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

/**
 * Get BMI category
 * @param {number} bmi - BMI value
 * @returns {string} BMI category
 */
export function getBMICategory(bmi) {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
}

/**
 * Calculate all metrics for a user
 * @param {Object} userData - User data
 * @returns {Object} Calculated metrics
 */
export function calculateAllMetrics(userData) {
    const { weight, height, age, gender, activityLevel } = userData;

    if (!weight || !height || !age) {
        return {
            bmr: 0,
            tdee: 0,
            bmi: 0,
            bmiCategory: 'N/A'
        };
    }

    const bmr = calculateBMR(weight, height, age, gender);
    const tdee = calculateTDEE(bmr, activityLevel);
    const bmi = calculateBMI(weight, height);
    const bmiCategory = getBMICategory(parseFloat(bmi));

    return {
        bmr,
        tdee,
        bmi: parseFloat(bmi),
        bmiCategory
    };
}
