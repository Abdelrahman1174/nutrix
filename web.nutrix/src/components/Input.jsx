import React from 'react';

/**
 * Input component with validation and premium styling
 * @param {Object} props
 * @param {string} props.label - Input label
 * @param {string} props.type - Input type (text/email/number/password)
 * @param {string} props.value - Input value
 * @param {Function} props.onChange - Change handler
 * @param {string} props.error - Error message
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.required - Required field
 * @param {number} props.min - Min value for number inputs
 * @param {number} props.max - Max value for number inputs
 * @param {string} props.className - Additional CSS classes
 */
export default function Input({
    label,
    type = 'text',
    value,
    onChange,
    error,
    placeholder,
    required = false,
    min,
    max,
    className = '',
    ...props
}) {
    const hasError = error && error.length > 0;

    return (
        <div className={`flex flex-col gap-1 ${className}`}>
            {label && (
                <label className="text-sm font-medium text-gray-300">
                    {label}
                    {required && <span className="text-primary ml-1">*</span>}
                </label>
            )}

            <input
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                min={min}
                max={max}
                className={`
          px-4 py-3 rounded-lg
          bg-surface border-2
          ${hasError ? 'border-red-500' : 'border-surface-light'}
          text-white placeholder-gray-500
          input-focus
          transition-smooth
          ${hasError ? 'focus:ring-red-500 focus:border-red-500' : ''}
        `}
                {...props}
            />

            {hasError && (
                <span className="text-sm text-red-400 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {error}
                </span>
            )}
        </div>
    );
}
