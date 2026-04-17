/**
 * @typedef {Object} MedicalReport
 * @property {string} id - Unique report identifier
 * @property {string} userId - User who owns this report
 * @property {string} reportType - Type of report (blood_test/checkup/screening)
 * @property {Date} uploadDate - When report was uploaded
 * @property {Date} reportDate - Actual date of medical test
 * @property {string} status - Processing status (processed/pending/error)
 * @property {Object[]} extractedValues - Biomarker values extracted from report
 */

/**
 * Report type enum
 */
export const REPORT_TYPES = {
    BLOOD_TEST: 'blood_test',
    CHECKUP: 'checkup',
    SCREENING: 'screening',
    OTHER: 'other'
};

/**
 * Report status enum
 */
export const REPORT_STATUS = {
    PROCESSED: 'processed',
    PENDING: 'pending',
    ERROR: 'error'
};

/**
 * Create a new medical report object
 * @param {Partial<MedicalReport>} data - Report data
 * @returns {MedicalReport}
 */
export function createMedicalReport(data = {}) {
    return {
        id: data.id || crypto.randomUUID(),
        userId: data.userId || '',
        reportType: data.reportType || REPORT_TYPES.BLOOD_TEST,
        uploadDate: data.uploadDate || new Date(),
        reportDate: data.reportDate || new Date(),
        status: data.status || REPORT_STATUS.PROCESSED,
        extractedValues: data.extractedValues || []
    };
}
