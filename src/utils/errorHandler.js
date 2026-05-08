/**
 * Centralized Error Handling Utility
 * Provides consistent error handling and user-friendly messages
 */

import { toast } from 'react-hot-toast';

// Error types for better categorization
export const ERROR_TYPES = {
  NETWORK: 'network',
  AUTH: 'auth',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

// User-friendly error messages
const ERROR_MESSAGES = {
  // Network errors
  'Network Error': 'Unable to connect to server. Please check your internet connection.',
  'ERR_NETWORK': 'Network connection failed. Please try again.',
  'ERR_INTERNET_DISCONNECTED': 'No internet connection. Please check your network.',
  
  // Authentication errors
  'Token is missing!': 'Please log in to continue.',
  'Token has expired!': 'Your session has expired. Please log in again.',
  'Token is invalid!': 'Invalid session. Please log in again.',
  'Unauthorized': 'You are not authorized to perform this action.',
  'Invalid credentials': 'Invalid email or password. Please try again.',
  
  // Validation errors
  'Email already exists': 'This email is already registered. Try logging in instead.',
  'Missing fields': 'Please fill in all required fields.',
  'Email is invalid': 'Please enter a valid email address.',
  
  // Server errors
  'Internal Server Error': 'Something went wrong on our end. Please try again later.',
  'Service Unavailable': 'Service is temporarily unavailable. Please try again later.',
  'Bad Gateway': 'Server is temporarily unavailable. Please try again later.',
  
  // Default messages
  default: 'Something went wrong. Please try again.'
};

/**
 * Get error type based on error object
 */
export const getErrorType = (error) => {
  if (!error.response && error.request) {
    return ERROR_TYPES.NETWORK;
  }
  
  const status = error.response?.status;
  if (status === 401 || status === 403) {
    return ERROR_TYPES.AUTH;
  }
  
  if (status >= 400 && status < 500) {
    return ERROR_TYPES.VALIDATION;
  }
  
  if (status >= 500) {
    return ERROR_TYPES.SERVER;
  }
  
  return ERROR_TYPES.UNKNOWN;
};

/**
 * Get user-friendly error message
 */
export const getErrorMessage = (error) => {
  // Check for custom message from API response
  const apiMessage = error.response?.data?.msg || 
                    error.response?.data?.message || 
                    error.response?.data?.error;
  
  if (apiMessage && ERROR_MESSAGES[apiMessage]) {
    return ERROR_MESSAGES[apiMessage];
  }
  
  // Check for standard error messages
  const errorMessage = error.message;
  if (ERROR_MESSAGES[errorMessage]) {
    return ERROR_MESSAGES[errorMessage];
  }
  
  // Check for HTTP status codes
  const status = error.response?.status;
  switch (status) {
    case 400:
      return 'Invalid request. Please check your input.';
    case 401:
      return 'Please log in to continue.';
    case 403:
      return 'You are not authorized to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'This action conflicts with existing data.';
    case 422:
      return 'Please check your input and try again.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Server is temporarily unavailable. Please try again later.';
    case 503:
      return 'Service is temporarily unavailable. Please try again later.';
    default:
      return apiMessage || ERROR_MESSAGES.default;
  }
};

/**
 * Handle error with appropriate user feedback
 */
export const handleError = (error, options = {}) => {
  const {
    showToast = true,
    logError = true,
    customMessage = null,
    onError = null
  } = options;
  
  const errorType = getErrorType(error);
  const errorMessage = customMessage || getErrorMessage(error);
  
  // Log error for debugging
  if (logError) {
    console.error('[Error Handler]', {
      type: errorType,
      message: errorMessage,
      originalError: error,
      response: error.response?.data,
      status: error.response?.status
    });
  }
  
  // Show user-friendly toast
  if (showToast) {
    const toastOptions = {
      duration: errorType === ERROR_TYPES.NETWORK ? 5000 : 4000,
      position: 'top-center'
    };
    
    switch (errorType) {
      case ERROR_TYPES.AUTH:
        toast.error(errorMessage, { ...toastOptions, icon: '🔒' });
        break;
      case ERROR_TYPES.NETWORK:
        toast.error(errorMessage, { ...toastOptions, icon: '📡' });
        break;
      case ERROR_TYPES.VALIDATION:
        toast.error(errorMessage, { ...toastOptions, icon: '⚠️' });
        break;
      case ERROR_TYPES.SERVER:
        toast.error(errorMessage, { ...toastOptions, icon: '🔧' });
        break;
      default:
        toast.error(errorMessage, toastOptions);
    }
  }
  
  // Execute custom error handler
  if (onError && typeof onError === 'function') {
    onError(error, errorType, errorMessage);
  }
  
  return {
    type: errorType,
    message: errorMessage,
    originalError: error
  };
};

/**
 * Async wrapper with error handling
 */
export const withErrorHandling = async (asyncFunction, options = {}) => {
  try {
    return await asyncFunction();
  } catch (error) {
    handleError(error, options);
    throw error; // Re-throw for component-level handling if needed
  }
};

/**
 * React hook for error handling
 */
export const useErrorHandler = () => {
  return {
    handleError,
    withErrorHandling,
    getErrorMessage,
    getErrorType
  };
};

export default {
  handleError,
  withErrorHandling,
  useErrorHandler,
  getErrorMessage,
  getErrorType,
  ERROR_TYPES
};