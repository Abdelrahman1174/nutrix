/**
 * @typedef {Object} Biomarker
 * @property {string} id - Unique biomarker identifier
 * @property {string} name - Biomarker name (e.g., "Hemoglobin", "Glucose")
 * @property {number} value - Measured value
 * @property {string} unit - Unit of measurement (e.g., "g/dL", "mg/dL")
 * @property {number} normalMin - Lower bound of normal range
 * @property {number} normalMax - Upper bound of normal range
 * @property {string} status - Status based on range (normal/low/high)
 * @property {Date} measuredAt - Measurement date
 */

/**
 * Biomarker status enum
 */
export const BIOMARKER_STATUS = {
    NORMAL: 'normal',
    LOW: 'low',
    HIGH: 'high'
};

/**
 * Common biomarkers with default normal ranges
 */
export const COMMON_BIOMARKERS = {
    hemoglobin: {
        name: 'Hemoglobin',
        unit: 'g/dL',
        normalMin: 12.0,
        normalMax: 16.0
    },
    glucose: {
        name: 'Blood Glucose',
        unit: 'mg/dL',
        normalMin: 70,
        normalMax: 100
    },
    cholesterol: {
        name: 'Total Cholesterol',
        unit: 'mg/dL',
        normalMin: 125,
        normalMax: 200
    },
    ldl: {
        name: 'LDL Cholesterol',
        unit: 'mg/dL',
        normalMin: 0,
        normalMax: 100
    },
    hdl: {
        name: 'HDL Cholesterol',
        unit: 'mg/dL',
        normalMin: 40,
        normalMax: 999
    },
    triglycerides: {
        name: 'Triglycerides',
        unit: 'mg/dL',
        normalMin: 0,
        normalMax: 150
    },
    hba1c: {
        name: 'HbA1c',
        unit: '%',
        normalMin: 4.0,
        normalMax: 5.7
    },
    systolicBP: {
        name: 'Systolic Blood Pressure',
        unit: 'mmHg',
        normalMin: 90,
        normalMax: 120
    },
    diastolicBP: {
        name: 'Diastolic Blood Pressure',
        unit: 'mmHg',
        normalMin: 60,
        normalMax: 80
    }
};

/**
 * Calculate biomarker status based on value and normal range
 * @param {number} value - Measured value
 * @param {number} normalMin - Lower bound of normal range
 * @param {number} normalMax - Upper bound of normal range
 * @returns {string} Status (normal/low/high)
 */
export function calculateStatus(value, normalMin, normalMax) {
    if (value < normalMin) return BIOMARKER_STATUS.LOW;
    if (value > normalMax) return BIOMARKER_STATUS.HIGH;
    return BIOMARKER_STATUS.NORMAL;
}

/**
 * Create a new biomarker object
 * @param {Partial<Biomarker>} data - Biomarker data
 * @returns {Biomarker}
 */
export function createBiomarker(data = {}) {
    const status = data.value && data.normalMin !== undefined && data.normalMax !== undefined
        ? calculateStatus(data.value, data.normalMin, data.normalMax)
        : BIOMARKER_STATUS.NORMAL;

    return {
        id: data.id || crypto.randomUUID(),
        name: data.name || '',
        value: data.value || 0,
        unit: data.unit || '',
        normalMin: data.normalMin || 0,
        normalMax: data.normalMax || 0,
        status: status,
        measuredAt: data.measuredAt || new Date()
    };
}
