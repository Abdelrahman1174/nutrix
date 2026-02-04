import { db } from '../services/mockDatabase.js';
import { createUser } from '../models/User.js';

/**
 * User Controller - Authentication for regular users
 * Handles user login and registration with role assignment
 */

/**
 * Authenticate regular user
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {{ success: boolean, user: Object, message: string }}
 */
export function authenticateUser(email, password) {
    const user = db.users.find(u => u.email === email && u.password === password);

    if (!user) {
        return { success: false, message: 'Invalid email or password' };
    }

    return {
        success: true,
        user: {
            id: user.id,
            email: user.email,
            name: user.name,
            role: 'user'
        }
    };
}

/**
 * Register new user
 * @param {string} email - Email
 * @param {string} password - Password
 * @param {string} name - Full name
 * @returns {{ success: boolean, message: string, user: Object }}
 */
export function registerUser(email, password, name) {
    // Check if user already exists
    const exists = db.users.find(u => u.email === email);
    if (exists) {
        return {
            success: false,
            message: 'User with this email already exists'
        };
    }

    // Create new user
    const newUser = createUser({
        id: crypto.randomUUID(),
        email,
        password, // In real app, hash this
        name,
        role: 'user'
    });

    db.users.push(newUser);

    return {
        success: true,
        message: 'Registration successful',
        user: {
            id: newUser.id,
            email: newUser.email,
            name: newUser.name,
            role: 'user'
        }
    };
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {User | null}
 */
export function getUserById(userId) {
    return db.users.find(u => u.id === userId) || null;
}
