import { createMealPlan } from '../models/MealPlan.js';

/**
 * Backend RAG service for meal plan generation
 * 
 * This is a MOCK implementation. To use a real backend:
 * 1. Set up your RAG backend service
 * 2. Set VITE_BACKEND_URL in your .env file
 * 3. Uncomment the real API implementation below
 */

const USE_MOCK = true; // Set to false when you have a real backend

/**
 * Generate personalized meal plan
 * @param {Object} userData - User profile data
 * @param {Array} biomarkers - User biomarkers
 * @param {string} predictedCondition - Predicted health condition
 * @returns {Promise<MealPlan>}
 */
export async function generateMealPlan(userData, biomarkers, predictedCondition) {
    if (USE_MOCK) {
        return mockGenerateMealPlan(userData, biomarkers, predictedCondition);
    }

    // Real implementation (requires backend)
    // const backendUrl = import.meta.env.VITE_BACKEND_URL;

    // try {
    //   const response = await fetch(`${backendUrl}/api/generate-meal-plan`, {
    //     method: 'POST',
    //     headers: {
    //       'Content-Type': 'application/json',
    //     },
    //     body: JSON.stringify({
    //       user: userData,
    //       biomarkers,
    //       condition: predictedCondition
    //     })
    //   });
    //   
    //   const data = await response.json();
    //   return createMealPlan(data.mealPlan);
    // } catch (error) {
    //   console.error('RAG service error:', error);
    //   throw new Error('Failed to generate meal plan');
    // }
}

/**
 * Mock meal plan generation
 * @param {Object} userData - User profile data
 * @param {Array} biomarkers - User biomarkers
 * @param {string} predictedCondition - Predicted health condition
 * @returns {Promise<MealPlan>}
 */
async function mockGenerateMealPlan(userData, biomarkers, predictedCondition) {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('Mock: Generating meal plan for', userData.name);
    console.log('Condition:', predictedCondition);
    console.log('TDEE:', userData.tdee);

    // Calculate calorie distribution (40% carbs, 30% protein, 30% fat)
    const targetCalories = userData.tdee || 2000;
    const carbsCalories = targetCalories * 0.4;
    const proteinCalories = targetCalories * 0.3;
    const fatsCalories = targetCalories * 0.3;

    // Convert to grams (carbs: 4 cal/g, protein: 4 cal/g, fat: 9 cal/g)
    const totalCarbs = Math.round(carbsCalories / 4);
    const totalProtein = Math.round(proteinCalories / 4);
    const totalFats = Math.round(fatsCalories / 9);

    // Distribute across three meals
    const breakfastRatio = 0.3;
    const lunchRatio = 0.4;
    const dinnerRatio = 0.3;

    // Generate condition-specific meal plan
    const meals = getConditionSpecificMeals(predictedCondition);

    return createMealPlan({
        userId: userData.id,
        breakfast: {
            name: 'Breakfast',
            foods: meals.breakfast,
            calories: Math.round(targetCalories * breakfastRatio),
            carbs: Math.round(totalCarbs * breakfastRatio),
            fats: Math.round(totalFats * breakfastRatio),
            protein: Math.round(totalProtein * breakfastRatio)
        },
        lunch: {
            name: 'Lunch',
            foods: meals.lunch,
            calories: Math.round(targetCalories * lunchRatio),
            carbs: Math.round(totalCarbs * lunchRatio),
            fats: Math.round(totalFats * lunchRatio),
            protein: Math.round(totalProtein * lunchRatio)
        },
        dinner: {
            name: 'Dinner',
            foods: meals.dinner,
            calories: Math.round(targetCalories * dinnerRatio),
            carbs: Math.round(totalCarbs * dinnerRatio),
            fats: Math.round(totalFats * dinnerRatio),
            protein: Math.round(totalProtein * dinnerRatio)
        }
    });
}

/**
 * Get condition-specific meal recommendations
 * @param {string} condition - Health condition
 * @returns {Object} Meal recommendations
 */
function getConditionSpecificMeals(condition) {
    const mealPlans = {
        anemia: {
            breakfast: ['Spinach and mushroom omelet', 'Whole wheat toast', 'Orange juice', 'Iron-fortified cereal'],
            lunch: ['Grilled chicken breast', 'Quinoa with lentils', 'Steamed broccoli', 'Mixed berries'],
            dinner: ['Grass-fed beef stir-fry', 'Brown rice', 'Bok choy', 'Dark chocolate (85% cocoa)']
        },
        diabetes: {
            breakfast: ['Greek yogurt with chia seeds', 'Almonds', 'Berries', 'Cinnamon tea'],
            lunch: ['Grilled salmon', 'Cauliflower rice', 'Asparagus', 'Mixed green salad'],
            dinner: ['Baked chicken thigh', 'Sweet potato (small)', 'Green beans', 'Avocado salad']
        },
        hypertension: {
            breakfast: ['Oatmeal with walnuts', 'Banana', 'Low-fat milk', 'Blueberries'],
            lunch: ['Grilled turkey breast', 'Quinoa', 'Roasted Brussels sprouts', 'Tomato salad'],
            dinner: ['Baked cod', 'Wild rice', 'Steamed carrots', 'Spinach salad with olive oil']
        },
        cholesterol: {
            breakfast: ['Oat bran cereal', 'Almond milk', 'Apple slices', 'Ground flaxseed'],
            lunch: ['Grilled salmon', 'Barley', 'Steamed edamame', 'Cucumber salad'],
            dinner: ['Skinless chicken breast', 'Bulgur wheat', 'Eggplant', 'Mixed vegetables']
        },
        fit: {
            breakfast: ['Scrambled eggs', 'Avocado toast', 'Mixed berries', 'Green tea'],
            lunch: ['Grilled chicken', 'Brown rice', 'Roasted vegetables', 'Side salad'],
            dinner: ['Baked fish', 'Quinoa', 'Steamed broccoli', 'Sweet potato']
        }
    };

    return mealPlans[condition] || mealPlans.fit;
}
