import { db } from '../services/mockDatabase.js';
import { createAuditLog, AUDIT_ACTIONS, ENTITY_TYPES } from '../models/AuditLog.js';
import { createFoodItem } from '../models/FoodItem.js';
import { createFoodSuitability } from '../models/FoodSuitability.js';

/**
 * Admin Controller - MVC Controller Layer
 * Handles all admin operations with validation logic (FR-14)
 */

/**
 * Search foods by name or description (FR-15)
 * @param {string} query - Search query
 * @returns {Array<FoodItem>} Matching food items
 */
export function searchFoods(query) {
    if (!query || query.trim() === '') {
        return db.foodItems;
    }

    const lowerQuery = query.toLowerCase();
    return db.foodItems.filter(food =>
        food.name.toLowerCase().includes(lowerQuery) ||
        food.description.toLowerCase().includes(lowerQuery) ||
        food.category.toLowerCase().includes(lowerQuery)
    );
}

/**
 * Validate food suitability based on clinical safety rules (FR-14)
 * @param {string} foodId - Food item ID
 * @param {string} conditionId - Condition ID
 * @param {boolean} proposedSuitability - Proposed suitability value
 * @returns {{ valid: boolean, message: string, autoCorrect: boolean }}
 */
export function validateSuitability(foodId, conditionId, proposedSuitability) {
    const food = db.foodItems.find(f => f.id === foodId);

    if (!food) {
        return { valid: false, message: 'Food item not found', autoCorrect: false };
    }

    // Clinical safety rules (FR-14)
    const rules = {
        // High-sodium foods should not be suitable for Hypertension
        hypertension_sodium: {
            condition: conditionId === 'hypertension',
            threshold: food.sodium > 400, // High sodium threshold
            shouldBe: false,
            message: `${food.name} has high sodium (${food.sodium}mg). Not suitable for Hypertension.`
        },

        // High-sugar foods should not be suitable for Diabetes
        diabetes_sugar: {
            condition: conditionId === 'diabetes',
            threshold: food.sugar > 8, // High sugar threshold
            shouldBe: false,
            message: `${food.name} has high sugar (${food.sugar}g). Not suitable for Diabetes.`
        },

        // Low-iron foods should not be suitable for Anemia patients
        anemia_iron: {
            condition: conditionId === 'anemia',
            threshold: food.iron < 0.5, // Low iron threshold
            shouldBe: false,
            message: `${food.name} has low iron (${food.iron}mg). Not suitable for Anemia.`
        },

        // High-cholesterol foods should not be suitable for High Cholesterol
        cholesterol_high: {
            condition: conditionId === 'cholesterol',
            threshold: food.cholesterol > 80, // High cholesterol threshold
            shouldBe: false,
            message: `${food.name} has high cholesterol (${food.cholesterol}mg). Not suitable for High Cholesterol.`
        }
    };

    // Check each rule
    for (const [ruleKey, rule] of Object.entries(rules)) {
        if (rule.condition && rule.threshold && proposedSuitability !== rule.shouldBe) {
            return {
                valid: false,
                message: rule.message,
                autoCorrect: true,
                correctValue: rule.shouldBe
            };
        }
    }

    return { valid: true, message: 'Suitability is valid', autoCorrect: false };
}

/**
 * Update food suitability
 * @param {string} foodId - Food item ID
 * @param {string} conditionId - Condition ID
 * @param {boolean} isSuitable - Suitability value
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string, data: FoodSuitability }}
 */
export function updateFoodSuitability(foodId, conditionId, isSuitable, adminEmail) {
    // Validate first (FR-14)
    const validation = validateSuitability(foodId, conditionId, isSuitable);

    if (!validation.valid && validation.autoCorrect) {
        return {
            success: false,
            message: validation.message,
            suggestedValue: validation.correctValue
        };
    }

    // Find and update suitability
    const suitabilityIndex = db.foodSuitability.findIndex(
        s => s.foodId === foodId && s.conditionId === conditionId
    );

    if (suitabilityIndex === -1) {
        // Create new suitability record
        const newSuitability = createFoodSuitability({
            foodId,
            conditionId,
            isSuitable,
            lastUpdatedBy: adminEmail
        });
        db.foodSuitability.push(newSuitability);

        // Log the action
        addAuditLog({
            action: AUDIT_ACTIONS.CREATE,
            entityType: ENTITY_TYPES.SUITABILITY,
            entityId: newSuitability.id,
            adminEmail,
            changes: { foodId, conditionId, isSuitable }
        });

        return {
            success: true,
            message: 'Suitability created successfully',
            data: newSuitability
        };
    }

    // Update existing record
    const oldValue = db.foodSuitability[suitabilityIndex].isSuitable;
    db.foodSuitability[suitabilityIndex] = createFoodSuitability({
        ...db.foodSuitability[suitabilityIndex],
        isSuitable,
        lastUpdatedBy: adminEmail,
        updatedAt: new Date()
    });

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.UPDATE,
        entityType: ENTITY_TYPES.SUITABILITY,
        entityId: db.foodSuitability[suitabilityIndex].id,
        adminEmail,
        changes: { foodId, conditionId, from: oldValue, to: isSuitable }
    });

    return {
        success: true,
        message: 'Suitability updated successfully',
        data: db.foodSuitability[suitabilityIndex]
    };
}

/**
 * Get food statistics for dashboard
 * @returns {Object} Statistics
 */
export function getFoodStats() {
    const totalFoods = db.foodItems.length;

    // Count foods without suitability labels (all false or incomplete)
    const foodsWithLabels = new Set();
    db.foodSuitability.forEach(s => {
        if (s.isSuitable !== undefined) {
            foodsWithLabels.add(s.foodId);
        }
    });
    const unlabeled = totalFoods - foodsWithLabels.size;

    const activeConditions = db.conditions.length;

    return {
        totalFoods,
        unlabeled,
        activeConditions,
        totalSuitabilityRecords: db.foodSuitability.length
    };
}

/**
 * Get audit logs
 * @param {number} limit - Number of logs to return
 * @returns {Array<AuditLog>} Audit logs
 */
export function getAuditLogs(limit = 10) {
    return db.auditLogs
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
}

/**
 * Create a new food item
 * @param {Object} foodData - Food data
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string, data: FoodItem }}
 */
export function createFood(foodData, adminEmail) {
    const newFood = createFoodItem(foodData);
    db.foodItems.push(newFood);

    // Create default suitability for all conditions
    db.conditions.forEach(condition => {
        db.foodSuitability.push(createFoodSuitability({
            foodId: newFood.id,
            conditionId: condition.id,
            isSuitable: true
        }));
    });

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.CREATE,
        entityType: ENTITY_TYPES.FOOD,
        entityId: newFood.id,
        adminEmail,
        changes: { name: newFood.name }
    });

    return {
        success: true,
        message: 'Food created successfully',
        data: newFood
    };
}

/**
 * Update a food item
 * @param {string} foodId - Food ID
 * @param {Object} updates - Updated data
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string, data: FoodItem }}
 */
export function updateFood(foodId, updates, adminEmail) {
    const index = db.foodItems.findIndex(f => f.id === foodId);

    if (index === -1) {
        return { success: false, message: 'Food not found' };
    }

    const oldFood = { ...db.foodItems[index] };
    db.foodItems[index] = createFoodItem({
        ...db.foodItems[index],
        ...updates,
        updatedAt: new Date()
    });

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.UPDATE,
        entityType: ENTITY_TYPES.FOOD,
        entityId: foodId,
        adminEmail,
        changes: updates
    });

    return {
        success: true,
        message: 'Food updated successfully',
        data: db.foodItems[index]
    };
}

/**
 * Delete a food item
 * @param {string} foodId - Food ID
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string }}
 */
export function deleteFood(foodId, adminEmail) {
    const index = db.foodItems.findIndex(f => f.id === foodId);

    if (index === -1) {
        return { success: false, message: 'Food not found' };
    }

    const foodName = db.foodItems[index].name;
    db.foodItems.splice(index, 1);

    // Remove suitability records
    db.foodSuitability = db.foodSuitability.filter(s => s.foodId !== foodId);

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.DELETE,
        entityType: ENTITY_TYPES.FOOD,
        entityId: foodId,
        adminEmail,
        changes: { name: foodName }
    });

    return {
        success: true,
        message: 'Food deleted successfully'
    };
}

/**
 * Get food suitability matrix
 * @returns {Array} Matrix data
 */
export function getSuitabilityMatrix() {
    return db.foodItems.map(food => {
        const row = {
            food,
            suitability: {}
        };

        db.conditions.forEach(condition => {
            const record = db.foodSuitability.find(
                s => s.foodId === food.id && s.conditionId === condition.id
            );
            row.suitability[condition.id] = record ? record.isSuitable : true;
        });

        return row;
    });
}

/**
 * Add audit log entry
 * @param {Object} logData - Log data
 */
function addAuditLog(logData) {
    const log = createAuditLog({
        ...logData,
        predictionTime: Math.floor(Math.random() * 200) + 50, // Mock: 50-250ms
        extractionTime: Math.floor(Math.random() * 500) + 100 // Mock: 100-600ms
    });
    db.auditLogs.unshift(log);
}

/**
 * Authenticate admin
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {{ success: boolean, admin: Object }}
 */
export function authenticateAdmin(email, password) {
    const admin = db.admins.find(a => a.email === email && a.password === password);

    if (!admin) {
        return { success: false, message: 'Invalid credentials' };
    }

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.LOGIN,
        entityType: ENTITY_TYPES.AUTH,
        entityId: admin.id,
        adminEmail: email,
        changes: {}
    });

    return {
        success: true,
        admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name
        }
    };
}

/**
 * Register new admin
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {string} name - Name
 * @param {string} secretKey - Secret key for validation
 * @returns {{ success: boolean, message: string }}
 */
export function registerAdmin(email, password, name, secretKey) {
    // Validate secret key
    const validSecretKey = 'NUTRIX_ADMIN_2026';

    if (secretKey !== validSecretKey) {
        return {
            success: false,
            message: 'Invalid secret key. Contact system administrator.'
        };
    }

    // Check if admin already exists
    const exists = db.admins.find(a => a.email === email);
    if (exists) {
        return {
            success: false,
            message: 'Admin with this email already exists'
        };
    }

    // Create new admin
    const newAdmin = {
        id: crypto.randomUUID(),
        email,
        password, // In real app, hash this
        name,
        secretKey
    };

    db.admins.push(newAdmin);

    return {
        success: true,
        message: 'Admin registered successfully'
    };
}

// ============================================================================
// USER ACCOUNT MANAGEMENT (FR-25)
// ============================================================================

/**
 * Get all registered users
 * @returns {Array<User>} All users
 */
export function getAllUsers() {
    return db.users;
}

/**
 * Update user account details
 * @param {string} userId - User ID
 * @param {Object} updates - Updated fields
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string, data: User }}
 */
export function updateUserAccount(userId, updates, adminEmail) {
    const index = db.users.findIndex(u => u.id === userId);

    if (index === -1) {
        return { success: false, message: 'User not found' };
    }

    const oldData = { ...db.users[index] };
    db.users[index] = {
        ...db.users[index],
        ...updates
    };

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.UPDATE,
        entityType: 'user',
        entityId: userId,
        adminEmail,
        changes: { from: oldData.email, to: updates.email || oldData.email, fields: Object.keys(updates) }
    });

    return {
        success: true,
        message: 'User account updated successfully',
        data: db.users[index]
    };
}

/**
 * Toggle user account status (suspend/activate)
 * @param {string} userId - User ID
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string, data: User }}
 */
export function toggleUserStatus(userId, adminEmail) {
    const index = db.users.findIndex(u => u.id === userId);

    if (index === -1) {
        return { success: false, message: 'User not found' };
    }

    const newStatus = db.users[index].status === 'active' ? 'suspended' : 'active';
    db.users[index].status = newStatus;

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.UPDATE,
        entityType: 'user',
        entityId: userId,
        adminEmail,
        changes: { status: newStatus }
    });

    return {
        success: true,
        message: `User ${newStatus === 'suspended' ? 'suspended' : 'activated'} successfully`,
        data: db.users[index]
    };
}

/**
 * Delete user account
 * @param {string} userId - User ID
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string }}
 */
export function deleteUserAccount(userId, adminEmail) {
    const index = db.users.findIndex(u => u.id === userId);

    if (index === -1) {
        return { success: false, message: 'User not found' };
    }

    const userName = db.users[index].name;
    db.users.splice(index, 1);

    // Remove user's medical reports
    db.medicalReports = db.medicalReports.filter(r => r.userId !== userId);

    // Remove user's meal plans
    db.mealPlans = db.mealPlans.filter(p => p.userId !== userId);

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.DELETE,
        entityType: 'user',
        entityId: userId,
        adminEmail,
        changes: { name: userName }
    });

    return {
        success: true,
        message: 'User deleted successfully'
    };
}

// ============================================================================
// CLINICAL DATA CORRECTION (FR-26)
// ============================================================================

/**
 * Update user's physical metrics
 * @param {string} userId - User ID
 * @param {Object} metrics - Physical metrics to update
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string, data: User }}
 */
export function correctHealthMetrics(userId, metrics, adminEmail) {
    const index = db.users.findIndex(u => u.id === userId);

    if (index === -1) {
        return { success: false, message: 'User not found' };
    }

    const oldMetrics = {
        weight: db.users[index].weight,
        height: db.users[index].height,
        age: db.users[index].age,
        activityLevel: db.users[index].activityLevel
    };

    // Update metrics
    if (metrics.weight !== undefined) db.users[index].weight = metrics.weight;
    if (metrics.height !== undefined) db.users[index].height = metrics.height;
    if (metrics.age !== undefined) db.users[index].age = metrics.age;
    if (metrics.activityLevel !== undefined) db.users[index].activityLevel = metrics.activityLevel;

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.UPDATE,
        entityType: 'user_metrics',
        entityId: userId,
        adminEmail,
        changes: { from: oldMetrics, to: metrics }
    });

    return {
        success: true,
        message: 'Health metrics updated successfully',
        data: db.users[index]
    };
}

/**
 * Get medical values (biomarkers) for a specific report
 * @param {string} reportId - Medical report ID
 * @returns {Array<Biomarker>} Biomarkers
 */
export function getMedicalValuesByReport(reportId) {
    const report = db.medicalReports.find(r => r.id === reportId);

    if (!report) {
        return [];
    }

    return db.medicalValues.filter(v => report.extractedValues.includes(v.id));
}

/**
 * Correct a medical value (biomarker)
 * @param {string} reportId - Report ID
 * @param {string} biomarkerId - Biomarker ID
 * @param {number} newValue - New value
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string, data: Biomarker }}
 */
export function correctMedicalValue(reportId, biomarkerId, newValue, adminEmail) {
    const report = db.medicalReports.find(r => r.id === reportId);

    if (!report) {
        return { success: false, message: 'Medical report not found' };
    }

    const index = db.medicalValues.findIndex(v => v.id === biomarkerId);

    if (index === -1) {
        return { success: false, message: 'Biomarker not found' };
    }

    const oldValue = db.medicalValues[index].value;
    db.medicalValues[index].value = newValue;

    // Recalculate status based on new value
    const biomarker = db.medicalValues[index];
    if (newValue < biomarker.normalMin) {
        biomarker.status = 'low';
    } else if (newValue > biomarker.normalMax) {
        biomarker.status = 'high';
    } else {
        biomarker.status = 'normal';
    }

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.UPDATE,
        entityType: 'medical_value',
        entityId: biomarkerId,
        adminEmail,
        changes: { name: biomarker.name, from: oldValue, to: newValue, status: biomarker.status }
    });

    return {
        success: true,
        message: 'Medical value corrected successfully',
        data: db.medicalValues[index]
    };
}

// ============================================================================
// CONTENT MODERATION (FR-27)
// ============================================================================

/**
 * Get all meal plans with optional filtering
 * @param {Object} filters - Optional filters
 * @returns {Array<MealPlan>} Meal plans
 */
export function getAllMealPlans(filters = {}) {
    let plans = db.mealPlans;

    if (filters.userId) {
        plans = plans.filter(p => p.userId === filters.userId);
    }

    return plans;
}

/**
 * Get meal plan by ID
 * @param {string} planId - Meal plan ID
 * @returns {MealPlan|null} Meal plan
 */
export function getMealPlanById(planId) {
    return db.mealPlans.find(p => p.id === planId) || null;
}

/**
 * Update meal plan macros
 * @param {string} planId - Meal plan ID
 * @param {Object} macros - Updated macros (calories, carbs, fats, protein)
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string, data: MealPlan }}
 */
export function updateMealPlanMacros(planId, macros, adminEmail) {
    const index = db.mealPlans.findIndex(p => p.id === planId);

    if (index === -1) {
        return { success: false, message: 'Meal plan not found' };
    }

    const oldMacros = {
        totalCalories: db.mealPlans[index].totalCalories,
        totalCarbs: db.mealPlans[index].totalCarbs,
        totalFats: db.mealPlans[index].totalFats,
        totalProtein: db.mealPlans[index].totalProtein
    };

    // Update macros
    if (macros.totalCalories !== undefined) db.mealPlans[index].totalCalories = macros.totalCalories;
    if (macros.totalCarbs !== undefined) db.mealPlans[index].totalCarbs = macros.totalCarbs;
    if (macros.totalFats !== undefined) db.mealPlans[index].totalFats = macros.totalFats;
    if (macros.totalProtein !== undefined) db.mealPlans[index].totalProtein = macros.totalProtein;

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.UPDATE,
        entityType: 'meal_plan',
        entityId: planId,
        adminEmail,
        changes: { from: oldMacros, to: macros }
    });

    return {
        success: true,
        message: 'Meal plan updated successfully',
        data: db.mealPlans[index]
    };
}

/**
 * Get all medical reports with optional filtering
 * @param {Object} filters - Optional filters
 * @returns {Array<MedicalReport>} Medical reports
 */
export function getAllMedicalReports(filters = {}) {
    let reports = db.medicalReports;

    if (filters.userId) {
        reports = reports.filter(r => r.userId === filters.userId);
    }

    if (filters.status) {
        reports = reports.filter(r => r.status === filters.status);
    }

    return reports;
}

/**
 * Delete a medical report
 * @param {string} reportId - Report ID
 * @param {string} adminEmail - Admin email
 * @returns {{ success: boolean, message: string }}
 */
export function deleteMedicalReport(reportId, adminEmail) {
    const index = db.medicalReports.findIndex(r => r.id === reportId);

    if (index === -1) {
        return { success: false, message: 'Medical report not found' };
    }

    const report = db.medicalReports[index];

    // Remove associated medical values
    db.medicalValues = db.medicalValues.filter(v => !report.extractedValues.includes(v.id));

    // Remove report
    db.medicalReports.splice(index, 1);

    // Log the action
    addAuditLog({
        action: AUDIT_ACTIONS.DELETE,
        entityType: 'medical_report',
        entityId: reportId,
        adminEmail,
        changes: { userId: report.userId, reportType: report.reportType }
    });

    return {
        success: true,
        message: 'Medical report deleted successfully'
    };
}

