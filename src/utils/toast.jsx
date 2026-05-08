/**
 * Simple Toast Notification System
 * No external dependencies - uses browser's built-in alert/console for now
 */

// Simple toast functions that use console for development
export const showToast = {
  success: (message, options = {}) => {
    console.log('✅ SUCCESS:', message);
    // In a real app, you'd show a proper toast notification
    return message;
  },

  error: (message, options = {}) => {
    console.error('❌ ERROR:', message);
    // In a real app, you'd show a proper toast notification
    return message;
  },

  warning: (message, options = {}) => {
    console.warn('⚠️ WARNING:', message);
    // In a real app, you'd show a proper toast notification
    return message;
  },

  info: (message, options = {}) => {
    console.info('ℹ️ INFO:', message);
    // In a real app, you'd show a proper toast notification
    return message;
  },

  loading: (message, options = {}) => {
    console.log('⏳ LOADING:', message);
    // In a real app, you'd show a proper toast notification
    return message;
  }
};

// Specialized toast functions for common use cases
export const apiToast = {
  // For API operations
  operation: async (operation, messages = {}) => {
    console.log('⏳', messages.loading || 'Processing...');

    try {
      const result = await operation();
      console.log('✅', messages.success || 'Operation completed successfully');
      return result;
    } catch (error) {
      console.error('❌', messages.error || 'Operation failed. Please try again.');
      throw error;
    }
  },

  // For form submissions
  submit: async (submitFn, messages = {}) => {
    return apiToast.operation(submitFn, {
      loading: messages.loading || 'Saving...',
      success: messages.success || 'Saved successfully',
      error: messages.error || 'Failed to save. Please try again.'
    });
  }
};

// Quick notification functions
export const notify = {
  saved: () => showToast.success('Changes saved successfully'),
  deleted: (item = 'Item') => showToast.success(`${item} deleted successfully`),
  updated: (item = 'Item') => showToast.success(`${item} updated successfully`),
  created: (item = 'Item') => showToast.success(`${item} created successfully`),
  
  networkError: () => showToast.error('Network error. Please check your connection.'),
  unauthorized: () => showToast.error('Please log in to continue.'),
  forbidden: () => showToast.error('You are not authorized to perform this action.'),
  notFound: () => showToast.error('The requested resource was not found.'),
  
  copying: () => showToast.info('Copied to clipboard'),
  uploading: () => showToast.loading('Uploading file...'),
  processing: () => showToast.loading('Processing...'),
  
  validationError: (field) => showToast.warning(`Please check the ${field} field`),
  required: (field) => showToast.warning(`${field} is required`),
  
  comingSoon: () => showToast.info('This feature is coming soon!'),
  maintenance: () => showToast.warning('This feature is under maintenance')
};

// React hook for toast notifications
export const useToast = () => {
  return {
    show: showToast,
    api: apiToast,
    notify
  };
};

export default {
  showToast,
  apiToast,
  notify,
  useToast
};