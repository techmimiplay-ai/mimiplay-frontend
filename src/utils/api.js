/**
 * Centralized API Utility
 * Provides consistent error handling and request patterns
 */

import axios from 'axios';
import { API_ENDPOINTS } from '../config';

/**
 * Standard API error handler
 * @param {Error} error - Axios error object
 * @returns {string} User-friendly error message
 */
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data?.msg || 'Invalid request. Please check your input.';
      case 401:
        return 'Session expired. Please login again.';
      case 403:
        return data?.msg || 'Access denied.';
      case 404:
        return 'Resource not found.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      default:
        return data?.msg || `Request failed with status ${status}`;
    }
  } else if (error.request) {
    // Network error
    return 'Network error. Please check your connection.';
  } else {
    // Other error
    return error.message || 'Something went wrong.';
  }
};

/**
 * Standardized API request wrapper
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {string} endpoint - API endpoint URL
 * @param {Object} data - Request data (for POST/PUT)
 * @param {Object} options - Additional request options
 * @returns {Promise} API response or throws standardized error
 */
export const apiRequest = async (method, endpoint, data = null, options = {}) => {
  try {
    let response;
    const config = {
      ...options,
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    };

    switch (method.toLowerCase()) {
      case 'get':
        response = await axios.get(endpoint, config);
        break;
      case 'post':
        response = await axios.post(endpoint, data, config);
        break;
      case 'put':
        response = await axios.put(endpoint, data, config);
        break;
      case 'delete':
        response = await axios.delete(endpoint, config);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }
    
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    throw new Error(errorMessage);
  }
};

/**
 * Legacy API request wrapper (for backward compatibility)
 * @param {Function} apiCall - Axios request function
 * @param {Object} options - Request options
 * @returns {Promise} API response or throws standardized error
 */
export const apiCall = async (requestFunction, options = {}) => {
  try {
    const response = await requestFunction();
    return response.data;
  } catch (error) {
    const errorMessage = handleApiError(error);
    throw new Error(errorMessage);
  }
};

/**
 * Common API patterns
 */
export const api = {
  // GET requests
  get: (endpoint, params = {}) => 
    apiCall(() => axios.get(endpoint, { params })),
  
  // POST requests
  post: (endpoint, data = {}) => 
    apiCall(() => axios.post(endpoint, data)),
  
  // PUT requests
  put: (endpoint, data = {}) => 
    apiCall(() => axios.put(endpoint, data)),
  
  // DELETE requests
  delete: (endpoint) => 
    apiCall(() => axios.delete(endpoint)),
  
  // File upload
  upload: (endpoint, formData) => 
    apiCall(() => axios.post(endpoint, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })),
};

/**
 * Specific API calls with proper error handling
 */
export const authApi = {
  login: (credentials) => api.post(API_ENDPOINTS.LOGIN, credentials),
  register: (userData) => api.post(API_ENDPOINTS.REGISTER, userData),
};

export const teacherApi = {
  getProfile: (teacherId) => api.get(API_ENDPOINTS.TEACHER_PROFILE(teacherId)),
  getDashboardStats: (teacherId) => api.get(API_ENDPOINTS.TEACHER_DASHBOARD_STATS(teacherId)),
  getAttendance: (params) => api.get(API_ENDPOINTS.TEACHER_ATTENDANCE, params),
  getReports: (params) => api.get(API_ENDPOINTS.TEACHER_REPORTS, params),
};

export const parentApi = {
  getChildren: (parentId) => api.get(API_ENDPOINTS.PARENT_MY_CHILDREN(parentId)),
  getChildStars: (studentId) => api.get(API_ENDPOINTS.PARENT_CHILD_STARS(studentId)),
  getProfile: (parentId) => api.get(API_ENDPOINTS.PARENT_PROFILE(parentId)),
};

export const adminApi = {
  getDashboardStats: () => api.get(API_ENDPOINTS.ADMIN_DASHBOARD_STATS),
  getPendingUsers: () => api.get(API_ENDPOINTS.ADMIN_PENDING_USERS),
  getAllUsers: () => api.get(API_ENDPOINTS.ADMIN_ALL_USERS),
  getAllStudents: () => api.get(API_ENDPOINTS.ADMIN_ALL_STUDENTS),
  approveUser: (id) => api.put(API_ENDPOINTS.ADMIN_APPROVE_USER(id)),
  rejectUser: (id) => api.delete(API_ENDPOINTS.ADMIN_REJECT_USER(id)),
};

export default api;