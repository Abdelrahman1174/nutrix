import toast from 'react-hot-toast';

/**
 * Toast utility functions for NutriX Admin
 * Styled to match the dark glass-morphism theme
 */

const toastConfig = {
    duration: 3500,
    style: {
        background: 'rgba(15, 23, 42, 0.95)',
        color: '#fff',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        padding: '16px',
        fontSize: '14px',
        fontWeight: '500'
    }
};

/**
 * Show success toast
 * @param {string} message - Success message
 */
export function showSuccess(message) {
    toast.success(message, {
        ...toastConfig,
        icon: '✅',
        style: {
            ...toastConfig.style,
            borderColor: 'rgba(34, 197, 94, 0.3)'
        }
    });
}

/**
 * Show error toast
 * @param {string} message - Error message
 */
export function showError(message) {
    toast.error(message, {
        ...toastConfig,
        icon: '❌',
        style: {
            ...toastConfig.style,
            borderColor: 'rgba(239, 68, 68, 0.3)'
        }
    });
}

/**
 * Show warning toast
 * @param {string} message - Warning message
 */
export function showWarning(message) {
    toast(message, {
        ...toastConfig,
        icon: '⚠️',
        style: {
            ...toastConfig.style,
            borderColor: 'rgba(249, 115, 22, 0.3)'
        }
    });
}

/**
 * Show info toast
 * @param {string} message - Info message
 */
export function showInfo(message) {
    toast(message, {
        ...toastConfig,
        icon: 'ℹ️',
        style: {
            ...toastConfig.style,
            borderColor: 'rgba(59, 130, 246, 0.3)'
        }
    });
}

/**
 * Show loading toast that can be updated
 * @param {string} message - Loading message
 * @returns {string} Toast ID for updating
 */
export function showLoading(message) {
    return toast.loading(message, {
        ...toastConfig
    });
}

/**
 * Update a loading toast with success/error
 * @param {string} toastId - Toast ID from showLoading
 * @param {string} message - Message
 * @param {boolean} success - Whether operation was successful
 */
export function updateToast(toastId, message, success = true) {
    if (success) {
        toast.success(message, {
            id: toastId,
            ...toastConfig,
            icon: '✅'
        });
    } else {
        toast.error(message, {
            id: toastId,
            ...toastConfig,
            icon: '❌'
        });
    }
}
