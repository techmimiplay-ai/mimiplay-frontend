/**
 * Enhanced Loading States Component
 * Provides various loading indicators for different use cases
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCw } from 'lucide-react';

// Loading spinner variants
const spinnerVariants = {
  spin: {
    rotate: 360,
    transition: {
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Pulse animation for skeleton loading
const pulseVariants = {
  pulse: {
    opacity: [0.5, 1, 0.5],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }
};

/**
 * Main Loading Component
 */
export const Loading = ({ 
  variant = 'spinner', 
  size = 'md', 
  text = '', 
  className = '',
  color = 'primary' 
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  const colorClasses = {
    primary: 'text-primary-600',
    white: 'text-white',
    gray: 'text-gray-600',
    blue: 'text-blue-600',
    green: 'text-green-600'
  };

  if (variant === 'dots') {
    return (
      <div className={`flex items-center justify-center gap-1 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className={`w-2 h-2 rounded-full ${colorClasses[color]} bg-current`}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
        {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
      </div>
    );
  }

  if (variant === 'pulse') {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <motion.div
          className={`${sizeClasses[size]} rounded-full ${colorClasses[color]} bg-current`}
          variants={pulseVariants}
          animate="pulse"
        />
        {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <motion.div
        variants={spinnerVariants}
        animate="spin"
        className={colorClasses[color]}
      >
        <Loader2 className={sizeClasses[size]} />
      </motion.div>
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

/**
 * Button Loading State
 */
export const ButtonLoading = ({ 
  loading = false, 
  children, 
  loadingText = 'Loading...', 
  className = '',
  ...props 
}) => {
  return (
    <button 
      {...props}
      disabled={loading || props.disabled}
      className={`relative ${className} ${loading ? 'cursor-not-allowed' : ''}`}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loading variant="spinner" size="sm" color="white" />
        </div>
      )}
      <span className={loading ? 'opacity-0' : 'opacity-100'}>
        {loading ? loadingText : children}
      </span>
    </button>
  );
};

/**
 * Page Loading Overlay
 */
export const PageLoading = ({ 
  text = 'Loading...', 
  emoji = '⏳',
  overlay = true 
}) => {
  const content = (
    <div className="flex flex-col items-center justify-center p-8">
      <motion.div
        className="text-4xl mb-4"
        animate={{ 
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      >
        {emoji}
      </motion.div>
      <Loading variant="spinner" size="lg" />
      <motion.p 
        className="text-lg font-semibold text-gray-700 mt-4"
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {text}
      </motion.p>
    </div>
  );

  if (overlay) {
    return (
      <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
        {content}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      {content}
    </div>
  );
};

/**
 * Skeleton Loading for Lists
 */
export const SkeletonLoader = ({ 
  rows = 3, 
  className = '',
  variant = 'list' 
}) => {
  if (variant === 'card') {
    return (
      <div className={`space-y-4 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            className="bg-white rounded-xl border-2 border-gray-100 p-6"
            variants={pulseVariants}
            animate="pulse"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-200 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (variant === 'table') {
    return (
      <div className={`space-y-3 ${className}`}>
        {Array.from({ length: rows }).map((_, i) => (
          <motion.div
            key={i}
            className="flex items-center space-x-4 p-4"
            variants={pulseVariants}
            animate="pulse"
          >
            <div className="w-8 h-8 bg-gray-200 rounded" />
            <div className="flex-1 h-4 bg-gray-200 rounded" />
            <div className="w-20 h-4 bg-gray-200 rounded" />
            <div className="w-16 h-4 bg-gray-200 rounded" />
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <motion.div
          key={i}
          className="flex items-center space-x-4"
          variants={pulseVariants}
          animate="pulse"
        >
          <div className="w-10 h-10 bg-gray-200 rounded-full" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

/**
 * Inline Loading for Small Components
 */
export const InlineLoading = ({ 
  text = '', 
  size = 'sm',
  className = '' 
}) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <Loading variant="spinner" size={size} />
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  );
};

/**
 * Form Loading State
 */
export const FormLoading = ({ loading = false, children }) => {
  return (
    <div className={`relative ${loading ? 'pointer-events-none' : ''}`}>
      {loading && (
        <div className="absolute inset-0 bg-white/70 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-xl">
          <Loading variant="spinner" size="lg" text="Saving..." />
        </div>
      )}
      <div className={loading ? 'opacity-50' : 'opacity-100'}>
        {children}
      </div>
    </div>
  );
};

/**
 * Refresh Loading Button
 */
export const RefreshButton = ({ 
  onRefresh, 
  loading = false, 
  className = '',
  size = 'md' 
}) => {
  return (
    <button
      onClick={onRefresh}
      disabled={loading}
      className={`
        p-2 rounded-lg border-2 border-gray-200 hover:border-primary-300 
        hover:bg-primary-50 transition-all duration-200 disabled:opacity-50
        ${className}
      `}
    >
      <motion.div
        animate={loading ? { rotate: 360 } : { rotate: 0 }}
        transition={loading ? { 
          duration: 1, 
          repeat: Infinity, 
          ease: "linear" 
        } : {}}
      >
        <RefreshCw className={`
          ${size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'}
          ${loading ? 'text-primary-600' : 'text-gray-600'}
        `} />
      </motion.div>
    </button>
  );
};

export default {
  Loading,
  ButtonLoading,
  PageLoading,
  SkeletonLoader,
  InlineLoading,
  FormLoading,
  RefreshButton
};