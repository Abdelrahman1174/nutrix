/**
 * Input validation service
 */

/**
 * Validation ranges for user inputs
 */
export const VALIDATION_RANGES = {
    age: { min: 18, max: 100 },
    weight: { min: 30, max: 300 },
    height: { min: 100, max: 250 }
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean}
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 * @param {string} password - Password
 * @returns {{ valid: boolean, message: string, strength: number }}
 */
export function validatePassword(password) {
    if (!password || password.length < 8) {
        return { valid: false, message: 'Password must be at least 8 characters', strength: 0 };
    }

    let strength = 0;
    const checks = {
        length: password.length >= 12,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    strength += checks.length ? 20 : 10;
    strength += checks.lowercase ? 20 : 0;
    strength += checks.uppercase ? 20 : 0;
    strength += checks.numbers ? 20 : 0;
    strength += checks.special ? 20 : 0;

    return {
        valid: true,
        message: strength >= 60 ? 'Strong password' : strength >= 40 ? 'Moderate password' : 'Weak password',
        strength
    };
}

/**
 * Validate number is within range
 * @param {number} value - Value to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {{ valid: boolean, message: string }}
 */
export function validateRange(value, min, max) {
    const num = parseFloat(value);

    if (isNaN(num)) {
        return { valid: false, message: 'Please enter a valid number' };
    }

    if (num < min) {
        return { valid: false, message: `Value must be at least ${min}` };
    }

    if (num > max) {
        return { valid: false, message: `Value must not exceed ${max}` };
    }

    return { valid: true, message: '' };
}

/**
 * Validate age
 * @param {number} age - Age in years
 * @returns {{ valid: boolean, message: string }}
 */
export function validateAge(age) {
    return validateRange(age, VALIDATION_RANGES.age.min, VALIDATION_RANGES.age.max);
}

/**
 * Validate weight
 * @param {number} weight - Weight in kg
 * @returns {{ valid: boolean, message: string }}
 */
export function validateWeight(weight) {
    return validateRange(weight, VALIDATION_RANGES.weight.min, VALIDATION_RANGES.weight.max);
}

/**
 * Validate height
 * @param {number} height - Height in cm
 * @returns {{ valid: boolean, message: string }}
 */
export function validateHeight(height) {
    return validateRange(height, VALIDATION_RANGES.height.min, VALIDATION_RANGES.height.max);
}

/**
 * Validate all form fields
 * @param {Object} fields - Fields to validate
 * @returns {Object} Validation errors by field name
 */
export function validateForm(fields) {
    const errors = {};

    Object.entries(fields).forEach(([key, value]) => {
        if (value.required && (!value.value || value.value === '')) {
            errors[key] = 'This field is required';
        } else if (value.type === 'email' && value.value) {
            if (!isValidEmail(value.value)) {
                errors[key] = 'Please enter a valid email address';
            }
        } else if (value.type === 'number' && value.value) {
            const result = validateRange(value.value, value.min, value.max);
            if (!result.valid) {
                errors[key] = result.message;
            }
        }
    });

    return errors;
}
