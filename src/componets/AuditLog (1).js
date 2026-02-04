/**
 * @typedef {Object} AuditLog
 * @property {string} id - Unique log ID
 * @property {string} action - Action type (create, update, delete)
 * @property {string} entityType - Target entity (food, condition, suitability)
 * @property {string} entityId - ID of the affected entity
 * @property {string} adminId - Admin who performed the action
 * @property {string} adminEmail - Admin email
 * @property {Object} changes - Details of what changed
 * @property {number} predictionTime - Time taken for prediction (ms)
 * @property {number} extractionTime - Time taken for extraction (ms)
 * @property {Date} timestamp - When the action occurred
 */

/**
 * Action types
 */
export const AUDIT_ACTIONS = {
    CREATE: 'create',
    UPDATE: 'update',
    DELETE: 'delete',
    LOGIN: 'login',
    LOGOUT: 'logout'
};

/**
 * Entity types
 */
export const ENTITY_TYPES = {
    FOOD: 'food',
    CONDITION: 'condition',
    SUITABILITY: 'suitability',
    AUTH: 'auth'
};

/**
 * Create a new audit log entry
 * @param {Partial<AuditLog>} data - Audit log data
 * @returns {AuditLog}
 */
export function createAuditLog(data = {}) {
    return {
        id: data.id || crypto.randomUUID(),
        action: data.action || AUDIT_ACTIONS.UPDATE,
        entityType: data.entityType || ENTITY_TYPES.FOOD,
        entityId: data.entityId || '',
        adminId: data.adminId || '',
        adminEmail: data.adminEmail || '',
        changes: data.changes || {},
        predictionTime: data.predictionTime || 0,
        extractionTime: data.extractionTime || 0,
        timestamp: data.timestamp || new Date()
    };
}
