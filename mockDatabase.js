import { createFoodItem } from '../models/FoodItem.js';
import { createFoodSuitability, CONDITION_IDS } from '../models/FoodSuitability.js';
import { createAuditLog, AUDIT_ACTIONS, ENTITY_TYPES } from '../models/AuditLog.js';
import { createMedicalReport, REPORT_TYPES, REPORT_STATUS } from '../models/MedicalReport.js';
import { createBiomarker, COMMON_BIOMARKERS } from '../models/Biomarker.js';
import { createMealPlan, createMeal } from '../models/MealPlan.js';
import { createUser } from '../models/User.js';

/**
 * Mock in-memory database for admin dashboard
 */

// Sample food items
export const foodItems = [
    createFoodItem({
        id: 'food_1',
        name: 'Spinach',
        description: 'Fresh leafy green vegetable',
        category: 'lunch',
        calories: 23,
        carbs: 3.6,
        protein: 2.9,
        fat: 0.4,
        sodium: 79,
        sugar: 0.4,
        cholesterol: 0,
        iron: 2.7
    }),
    createFoodItem({
        id: 'food_2',
        name: 'White Rice',
        description: 'Cooked white rice',
        category: 'lunch',
        calories: 130,
        carbs: 28,
        protein: 2.7,
        fat: 0.3,
        sodium: 1,
        sugar: 0.1,
        cholesterol: 0,
        iron: 0.2
    }),
    createFoodItem({
        id: 'food_3',
        name: 'Bacon',
        description: 'Crispy fried bacon',
        category: 'breakfast',
        calories: 541,
        carbs: 1.4,
        protein: 37,
        fat: 42,
        sodium: 1717,
        sugar: 1.2,
        cholesterol: 110,
        iron: 1.0
    }),
    createFoodItem({
        id: 'food_4',
        name: 'Salmon',
        description: 'Grilled salmon fillet',
        category: 'dinner',
        calories: 206,
        carbs: 0,
        protein: 22,
        fat: 13,
        sodium: 59,
        sugar: 0,
        cholesterol: 63,
        iron: 0.3
    }),
    createFoodItem({
        id: 'food_5',
        name: 'Brown Rice',
        description: 'Cooked brown rice',
        category: 'lunch',
        calories: 111,
        carbs: 23,
        protein: 2.6,
        fat: 0.9,
        sodium: 5,
        sugar: 0.4,
        cholesterol: 0,
        iron: 0.4
    }),
    createFoodItem({
        id: 'food_6',
        name: 'Greek Yogurt',
        description: 'Plain Greek yogurt',
        category: 'breakfast',
        calories: 59,
        carbs: 3.6,
        protein: 10,
        fat: 0.4,
        sodium: 36,
        sugar: 3.2,
        cholesterol: 5,
        iron: 0.1
    }),
    createFoodItem({
        id: 'food_7',
        name: 'Almonds',
        description: 'Raw almonds',
        category: 'snack',
        calories: 579,
        carbs: 22,
        protein: 21,
        fat: 50,
        sodium: 1,
        sugar: 4.4,
        cholesterol: 0,
        iron: 3.7
    }),
    createFoodItem({
        id: 'food_8',
        name: 'Soda',
        description: 'Carbonated soft drink',
        category: 'snack',
        calories: 41,
        carbs: 10.6,
        protein: 0,
        fat: 0,
        sodium: 4,
        sugar: 10.6,
        cholesterol: 0,
        iron: 0
    }),
    createFoodItem({
        id: 'food_9',
        name: 'Broccoli',
        description: 'Steamed broccoli',
        category: 'lunch',
        calories: 34,
        carbs: 7,
        protein: 2.8,
        fat: 0.4,
        sodium: 33,
        sugar: 1.7,
        cholesterol: 0,
        iron: 0.7
    }),
    createFoodItem({
        id: 'food_10',
        name: 'Chicken Breast',
        description: 'Grilled chicken breast',
        category: 'dinner',
        calories: 165,
        carbs: 0,
        protein: 31,
        fat: 3.6,
        sodium: 74,
        sugar: 0,
        cholesterol: 85,
        iron: 0.9
    }),
    createFoodItem({
        id: 'food_11',
        name: 'Sausage',
        description: 'Pork sausage',
        category: 'breakfast',
        calories: 301,
        carbs: 1.4,
        protein: 13,
        fat: 27,
        sodium: 807,
        sugar: 0.7,
        cholesterol: 71,
        iron: 1.3
    }),
    createFoodItem({
        id: 'food_12',
        name: 'Quinoa',
        description: 'Cooked quinoa',
        category: 'lunch',
        calories: 120,
        carbs: 21,
        protein: 4.4,
        fat: 1.9,
        sodium: 7,
        sugar: 0.9,
        cholesterol: 0,
        iron: 1.5
    }),
    createFoodItem({
        id: 'food_13',
        name: 'Avocado',
        description: 'Fresh avocado',
        category: 'snack',
        calories: 160,
        carbs: 8.5,
        protein: 2,
        fat: 15,
        sodium: 7,
        sugar: 0.7,
        cholesterol: 0,
        iron: 0.6
    }),
    createFoodItem({
        id: 'food_14',
        name: 'Eggs',
        description: 'Scrambled eggs',
        category: 'breakfast',
        calories: 147,
        carbs: 1.1,
        protein: 12.6,
        fat: 9.9,
        sodium: 142,
        sugar: 0.4,
        cholesterol: 372,
        iron: 1.8
    }),
    createFoodItem({
        id: 'food_15',
        name: 'Sweet Potato',
        description: 'Baked sweet potato',
        category: 'dinner',
        calories: 86,
        carbs: 20,
        protein: 1.6,
        fat: 0.1,
        sodium: 55,
        sugar: 4.2,
        cholesterol: 0,
        iron: 0.6
    }),
    createFoodItem({
        id: 'food_16',
        name: 'Pizza',
        description: 'Cheese pizza slice',
        category: 'lunch',
        calories: 266,
        carbs: 33,
        protein: 11,
        fat: 10,
        sodium: 551,
        sugar: 3.8,
        cholesterol: 18,
        iron: 1.6
    }),
    createFoodItem({
        id: 'food_17',
        name: 'Lentils',
        description: 'Cooked lentils',
        category: 'lunch',
        calories: 116,
        carbs: 20,
        protein: 9,
        fat: 0.4,
        sodium: 2,
        sugar: 1.8,
        cholesterol: 0,
        iron: 3.3
    }),
    createFoodItem({
        id: 'food_18',
        name: 'Cheese',
        description: 'Cheddar cheese',
        category: 'snack',
        calories: 402,
        carbs: 1.3,
        protein: 25,
        fat: 33,
        sodium: 621,
        sugar: 0.5,
        cholesterol: 105,
        iron: 0.7
    }),
    createFoodItem({
        id: 'food_19',
        name: 'Oatmeal',
        description: 'Cooked oatmeal',
        category: 'breakfast',
        calories: 71,
        carbs: 12,
        protein: 2.5,
        fat: 1.5,
        sodium: 49,
        sugar: 0.3,
        cholesterol: 0,
        iron: 1.0
    }),
    createFoodItem({
        id: 'food_20',
        name: 'Apple',
        description: 'Fresh apple',
        category: 'snack',
        calories: 52,
        carbs: 14,
        protein: 0.3,
        fat: 0.2,
        sodium: 1,
        sugar: 10,
        cholesterol: 0,
        iron: 0.1
    })
];

// Health conditions
export const conditions = [
    { id: CONDITION_IDS.ANEMIA, name: 'Anemia', description: 'Low iron levels' },
    { id: CONDITION_IDS.DIABETES, name: 'Diabetes', description: 'High blood sugar' },
    { id: CONDITION_IDS.HYPERTENSION, name: 'Hypertension', description: 'High blood pressure' },
    { id: CONDITION_IDS.CHOLESTEROL, name: 'High Cholesterol', description: 'Elevated cholesterol' }
];

// Initialize food suitability matrix
export const foodSuitability = [];
foodItems.forEach(food => {
    conditions.forEach(condition => {
        // Default all to suitable, will be validated by controller
        foodSuitability.push(createFoodSuitability({
            foodId: food.id,
            conditionId: condition.id,
            isSuitable: true
        }));
    });
});

// Audit logs
export const auditLogs = [
    createAuditLog({
        action: AUDIT_ACTIONS.CREATE,
        entityType: ENTITY_TYPES.FOOD,
        entityId: 'food_1',
        adminEmail: 'admin@nutrix.com',
        changes: { name: 'Spinach' },
        predictionTime: 125,
        extractionTime: 450,
        timestamp: new Date(Date.now() - 3600000)
    }),
    createAuditLog({
        action: AUDIT_ACTIONS.UPDATE,
        entityType: ENTITY_TYPES.SUITABILITY,
        entityId: 'food_3',
        adminEmail: 'admin@nutrix.com',
        changes: { condition: 'hypertension', isSuitable: false },
        predictionTime: 89,
        extractionTime: 320,
        timestamp: new Date(Date.now() - 1800000)
    })
];

// Regular users (mock) - Enhanced with complete profiles
export const users = [
    createUser({
        id: 'user_1',
        email: 'user@nutrix.com',
        password: 'user123', // In real app, this would be hashed
        name: 'Demo User',
        role: 'user',
        status: 'active',
        age: 28,
        gender: 'male',
        height: 175,
        weight: 75,
        activityLevel: 'moderate',
        bmr: 1650,
        tdee: 2550,
        createdAt: new Date('2026-01-15')
    }),
    createUser({
        id: 'user_2',
        email: 'john@example.com',
        password: 'john123',
        name: 'John Doe',
        role: 'user',
        status: 'active',
        age: 35,
        gender: 'male',
        height: 180,
        weight: 85,
        activityLevel: 'active',
        bmr: 1850,
        tdee: 3200,
        createdAt: new Date('2026-01-20')
    }),
    createUser({
        id: 'user_3',
        email: 'sarah@example.com',
        password: 'sarah123',
        name: 'Sarah Johnson',
        role: 'user',
        status: 'active',
        age: 30,
        gender: 'female',
        height: 165,
        weight: 62,
        activityLevel: 'light',
        bmr: 1380,
        tdee: 1900,
        createdAt: new Date('2026-01-25')
    }),
    createUser({
        id: 'user_4',
        email: 'mike@example.com',
        password: 'mike123',
        name: 'Mike Williams',
        role: 'user',
        status: 'suspended',
        age: 42,
        gender: 'male',
        height: 178,
        weight: 92,
        activityLevel: 'sedentary',
        bmr: 1720,
        tdee: 2060,
        createdAt: new Date('2026-02-01')
    })
];

// Admin credentials (mock)
export const admins = [
    {
        id: 'admin_1',
        email: 'admin@nutrix.com',
        password: 'admin123', // In real app, this would be hashed
        name: 'Admin User',
        secretKey: 'NUTRIX_ADMIN_2026'
    }
];

// Medical reports with extracted biomarker values
export const medicalReports = [
    createMedicalReport({
        id: 'report_1',
        userId: 'user_1',
        reportType: REPORT_TYPES.BLOOD_TEST,
        uploadDate: new Date('2026-02-01'),
        reportDate: new Date('2026-01-28'),
        status: REPORT_STATUS.PROCESSED,
        extractedValues: ['biomarker_1', 'biomarker_2', 'biomarker_3', 'biomarker_4']
    }),
    createMedicalReport({
        id: 'report_2',
        userId: 'user_2',
        reportType: REPORT_TYPES.CHECKUP,
        uploadDate: new Date('2026-02-02'),
        reportDate: new Date('2026-01-30'),
        status: REPORT_STATUS.PROCESSED,
        extractedValues: ['biomarker_5', 'biomarker_6', 'biomarker_7']
    }),
    createMedicalReport({
        id: 'report_3',
        userId: 'user_3',
        reportType: REPORT_TYPES.BLOOD_TEST,
        uploadDate: new Date('2026-02-03'),
        reportDate: new Date('2026-02-01'),
        status: REPORT_STATUS.PROCESSED,
        extractedValues: ['biomarker_8', 'biomarker_9']
    })
];

// Medical values (biomarkers) extracted from reports
export const medicalValues = [
    // Report 1 biomarkers
    createBiomarker({
        id: 'biomarker_1',
        name: COMMON_BIOMARKERS.glucose.name,
        value: 95,
        unit: COMMON_BIOMARKERS.glucose.unit,
        normalMin: COMMON_BIOMARKERS.glucose.normalMin,
        normalMax: COMMON_BIOMARKERS.glucose.normalMax,
        measuredAt: new Date('2026-01-28')
    }),
    createBiomarker({
        id: 'biomarker_2',
        name: COMMON_BIOMARKERS.cholesterol.name,
        value: 185,
        unit: COMMON_BIOMARKERS.cholesterol.unit,
        normalMin: COMMON_BIOMARKERS.cholesterol.normalMin,
        normalMax: COMMON_BIOMARKERS.cholesterol.normalMax,
        measuredAt: new Date('2026-01-28')
    }),
    createBiomarker({
        id: 'biomarker_3',
        name: COMMON_BIOMARKERS.hba1c.name,
        value: 5.3,
        unit: COMMON_BIOMARKERS.hba1c.unit,
        normalMin: COMMON_BIOMARKERS.hba1c.normalMin,
        normalMax: COMMON_BIOMARKERS.hba1c.normalMax,
        measuredAt: new Date('2026-01-28')
    }),
    createBiomarker({
        id: 'biomarker_4',
        name: COMMON_BIOMARKERS.hemoglobin.name,
        value: 14.5,
        unit: COMMON_BIOMARKERS.hemoglobin.unit,
        normalMin: COMMON_BIOMARKERS.hemoglobin.normalMin,
        normalMax: COMMON_BIOMARKERS.hemoglobin.normalMax,
        measuredAt: new Date('2026-01-28')
    }),
    // Report 2 biomarkers
    createBiomarker({
        id: 'biomarker_5',
        name: COMMON_BIOMARKERS.systolicBP.name,
        value: 125,
        unit: COMMON_BIOMARKERS.systolicBP.unit,
        normalMin: COMMON_BIOMARKERS.systolicBP.normalMin,
        normalMax: COMMON_BIOMARKERS.systolicBP.normalMax,
        measuredAt: new Date('2026-01-30')
    }),
    createBiomarker({
        id: 'biomarker_6',
        name: COMMON_BIOMARKERS.diastolicBP.name,
        value: 82,
        unit: COMMON_BIOMARKERS.diastolicBP.unit,
        normalMin: COMMON_BIOMARKERS.diastolicBP.normalMin,
        normalMax: COMMON_BIOMARKERS.diastolicBP.normalMax,
        measuredAt: new Date('2026-01-30')
    }),
    createBiomarker({
        id: 'biomarker_7',
        name: COMMON_BIOMARKERS.glucose.name,
        value: 110,
        unit: COMMON_BIOMARKERS.glucose.unit,
        normalMin: COMMON_BIOMARKERS.glucose.normalMin,
        normalMax: COMMON_BIOMARKERS.glucose.normalMax,
        measuredAt: new Date('2026-01-30')
    }),
    // Report 3 biomarkers
    createBiomarker({
        id: 'biomarker_8',
        name: COMMON_BIOMARKERS.ldl.name,
        value: 95,
        unit: COMMON_BIOMARKERS.ldl.unit,
        normalMin: COMMON_BIOMARKERS.ldl.normalMin,
        normalMax: COMMON_BIOMARKERS.ldl.normalMax,
        measuredAt: new Date('2026-02-01')
    }),
    createBiomarker({
        id: 'biomarker_9',
        name: COMMON_BIOMARKERS.hdl.name,
        value: 55,
        unit: COMMON_BIOMARKERS.hdl.unit,
        normalMin: COMMON_BIOMARKERS.hdl.normalMin,
        normalMax: COMMON_BIOMARKERS.hdl.normalMax,
        measuredAt: new Date('2026-02-01')
    })
];

// Meal plans generated for users
export const mealPlans = [
    createMealPlan({
        id: 'plan_1',
        userId: 'user_1',
        breakfast: createMeal({
            name: 'Breakfast',
            foods: ['Oatmeal', 'Greek Yogurt', 'Apple'],
            calories: 400,
            carbs: 65,
            fats: 8,
            protein: 20
        }),
        lunch: createMeal({
            name: 'Lunch',
            foods: ['Chicken Breast', 'Brown Rice', 'Broccoli'],
            calories: 550,
            carbs: 55,
            fats: 12,
            protein: 45
        }),
        dinner: createMeal({
            name: 'Dinner',
            foods: ['Salmon', 'Quinoa', 'Spinach'],
            calories: 600,
            carbs: 50,
            fats: 22,
            protein: 40
        }),
        generatedAt: new Date('2026-02-01')
    }),
    createMealPlan({
        id: 'plan_2',
        userId: 'user_2',
        breakfast: createMeal({
            name: 'Breakfast',
            foods: ['Eggs', 'Avocado', 'Sweet Potato'],
            calories: 480,
            carbs: 45,
            fats: 20,
            protein: 28
        }),
        lunch: createMeal({
            name: 'Lunch',
            foods: ['Lentils', 'Brown Rice', 'Spinach'],
            calories: 520,
            carbs: 75,
            fats: 8,
            protein: 22
        }),
        dinner: createMeal({
            name: 'Dinner',
            foods: ['Chicken Breast', 'Quinoa', 'Broccoli'],
            calories: 580,
            carbs: 52,
            fats: 14,
            protein: 48
        }),
        generatedAt: new Date('2026-02-02')
    }),
    createMealPlan({
        id: 'plan_3',
        userId: 'user_3',
        breakfast: createMeal({
            name: 'Breakfast',
            foods: ['Greek Yogurt', 'Almonds', 'Apple'],
            calories: 350,
            carbs: 40,
            fats: 15,
            protein: 18
        }),
        lunch: createMeal({
            name: 'Lunch',
            foods: ['Salmon', 'Sweet Potato', 'Spinach'],
            calories: 450,
            carbs: 42,
            fats: 18,
            protein: 32
        }),
        dinner: createMeal({
            name: 'Dinner',
            foods: ['Chicken Breast', 'Brown Rice', 'Broccoli'],
            calories: 480,
            carbs: 48,
            fats: 10,
            protein: 38
        }),
        generatedAt: new Date('2026-02-03')
    })
];

// Export the database API
export const db = {
    foodItems,
    conditions,
    foodSuitability,
    auditLogs,
    users,
    admins,
    medicalReports,
    medicalValues,
    mealPlans
};

