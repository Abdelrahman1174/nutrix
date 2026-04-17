import React from 'react';
import { motion } from 'framer-motion';

/**
 * Premium card component with glass-morphism effect
 * @param {Object} props
 * @param {React.ReactNode} props.children - Card content
 * @param {string} props.title - Card title
 * @param {string} props.subtitle - Card subtitle
 * @param {'default' | 'orange'} props.variant - Card style variant
 * @param {string} props.className - Additional CSS classes
 * @param {boolean} props.hoverable - Enable hover effect
 */
export default function Card({
    children,
    title,
    subtitle,
    variant = 'default',
    className = '',
    hoverable = false,
    ...props
}) {
    const variantStyles = {
        default: 'glass',
        orange: 'glass-orange'
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            whileHover={hoverable ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
            className={`
        ${variantStyles[variant]}
        rounded-xl p-6
        transition-smooth
        ${hoverable ? 'hover:shadow-xl hover:shadow-primary/10 cursor-pointer' : ''}
        ${className}
      `}
            {...props}
        >
            {(title || subtitle) && (
                <div className="mb-4">
                    {title && (
                        <h3 className="text-xl font-bold text-white mb-1">
                            {title}
                        </h3>
                    )}
                    {subtitle && (
                        <p className="text-sm text-gray-400">
                            {subtitle}
                        </p>
                    )}
                </div>
            )}

            {children}
        </motion.div>
    );
}
