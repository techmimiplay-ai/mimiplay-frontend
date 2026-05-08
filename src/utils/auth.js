/**
 * Centralized Logout Utility
 * Ensures consistent logout behavior across the entire application
 */

/**
 * Clear all user session data including Mimi customizations
 * This ensures every logout resets Mimi to default settings
 */
export const clearUserSession = () => {
  // Clear authentication data
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('userId');
  
  // Clear Mimi customizations - reset to defaults
  localStorage.removeItem('mimi_bg');      // Reset background to default
  localStorage.removeItem('mimi_clothes'); // Reset dress to overall
  
  // Clear other user-specific data
  localStorage.removeItem('selectedChild');
  
  // Dispatch event to notify components of logout
  window.dispatchEvent(new Event('user_logout'));
};

/**
 * Perform logout and redirect to login page
 * @param {Function} navigate - React Router navigate function (optional)
 */
export const performLogout = (navigate = null) => {
  clearUserSession();
  
  if (navigate) {
    navigate('/login');
  } else {
    window.location.href = '/login';
  }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has valid token
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

/**
 * Get current user role
 * @returns {string|null} User role or null if not authenticated
 */
export const getUserRole = () => {
  return localStorage.getItem('role');
};

export default {
  clearUserSession,
  performLogout,
  isAuthenticated,
  getUserRole
};