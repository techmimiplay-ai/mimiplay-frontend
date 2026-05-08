import axios from 'axios';
import { clearUserSession } from './utils/auth';

// /**
//  * Application Configuration
//  * Environment variables can be overridden via .env file
//  */

// export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

// export const API_ENDPOINTS = {
//   GET_STATUS: `${API_BASE_URL}/get-status`,
//   START_CLASSROOM: `${API_BASE_URL}/start-classroom`,
//   START_MIMI_SESSION: `${API_BASE_URL}/start-mimi-session`,
//   GET_MIMI_STATUS: `${API_BASE_URL}/mimi-get`,
// };

// export default {
//   API_BASE_URL,
//   API_ENDPOINTS,
// };


// src/config.js
const _raw = import.meta.env.VITE_API_URL || '';

// SSRF guard: only allow origins defined at build time via env vars.
// No user-supplied URLs are ever used — all endpoints are built from this validated base.
const _allowed = (import.meta.env.VITE_ALLOWED_ORIGINS || _raw)
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

const _isAllowed = (url) => {
  try {
    const { origin, protocol } = new URL(url);
    const isLocalDev = url.startsWith('http://localhost') || url.startsWith('http://127.0.0.1');
    if (protocol !== 'https:' && !isLocalDev) return false;
    return _allowed.some(a => { try { return origin === new URL(a).origin; } catch { return false; } });
  } catch { return false; }
};

if (_raw && !_isAllowed(_raw)) {
  throw new Error(`[config] VITE_API_URL "${_raw}" is not in the allowed origins list.`);
}

export const API_BASE_URL = _raw;

// ── Global request interceptor — attaches Bearer token to every outgoing request
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) config.headers['Authorization'] = `Bearer ${token}`;
    return config;
  },
  err => Promise.reject(err)
);

// ── Global 401/403 interceptor — redirects to login on expired/invalid token
axios.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401 || err.response?.status === 403) {
      clearUserSession();
      
      // Prevent reload loop if already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ✅ Token helper
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const API_ENDPOINTS = {
  // Auth endpoints
  LOGIN: `${API_BASE_URL}/api/login`,
  REGISTER: `${API_BASE_URL}/api/register`,
  FORGOT_PASSWORD: `${API_BASE_URL}/api/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/api/reset-password`,
  
  // Core Mimi Chat endpoints
  START_MIMI_SESSION: `${API_BASE_URL}/start-mimi-session`,
  MIMI_GET: `${API_BASE_URL}/mimi-get`,
  MIMI_CHAT_AUDIO: `${API_BASE_URL}/mimi-chat-audio`,
  MIMI_WAKE: `${API_BASE_URL}/mimi-wake`,
  MIMI_SAVE_CHAT: `${API_BASE_URL}/mimi-save-chat`,
  MIMI_STOP_SESSION: `${API_BASE_URL}/api/mimi/stop-session`,
  
  // Face detection endpoints
  PROCESS_FRAME: `${API_BASE_URL}/process-frame`,
  REGISTER_FACE: `${API_BASE_URL}/register-face`,
  GET_STUDENT_ID: `${API_BASE_URL}/get-student-id-by-name`,
  
  // Activity endpoints
  ACTIVITY_CHECK_AUDIO: `${API_BASE_URL}/activity-check-audio`,
  GENERATE_QUESTIONS: `${API_BASE_URL}/generate-activity-questions`,
  ACTIVITY_SAVE_RESULT: `${API_BASE_URL}/save-activity-result`,
  STOP_FACE_DETECT: `${API_BASE_URL}/stop-face-detect`,
  
  UPLOAD_SESSION_VIDEO: `${API_BASE_URL}/upload-session-video`,
  SEND_VIDEO_TO_PARENT: `${API_BASE_URL}/send-video-to-parent`,
  
  // TTS endpoint
  SPEAK: `${API_BASE_URL}/speak`,
  // Admin endpoints
  ADMIN_DASHBOARD_STATS: `${API_BASE_URL}/api/admin/dashboard-stats`,
  ADMIN_PENDING_USERS: `${API_BASE_URL}/api/admin/pending-users`,
  ADMIN_ALL_USERS: `${API_BASE_URL}/api/admin/all-users`,
  ADMIN_ALL_STUDENTS: `${API_BASE_URL}/api/admin/all-students`,
  ADMIN_ALL_STUDENTS_WITH_STATS: `${API_BASE_URL}/api/admin/all-students-with-stats`,
  ADMIN_APPROVE_USER: (id) => `${API_BASE_URL}/api/admin/approve/${id}`,
  ADMIN_REJECT_USER: (id) => `${API_BASE_URL}/api/admin/reject/${id}`,
  ADMIN_DEACTIVATE_USER: (id) => `${API_BASE_URL}/api/admin/deactivate/${id}`,
  ADMIN_ADD_TEACHER: `${API_BASE_URL}/api/admin/add-teacher`,
  ADMIN_EDIT_TEACHER: (id) => `${API_BASE_URL}/api/admin/edit-teacher/${id}`,
  ADMIN_ADD_STUDENT: `${API_BASE_URL}/api/admin/add-student`,
  ADMIN_EDIT_STUDENT: (id) => `${API_BASE_URL}/api/admin/edit-student/${id}`,
  ADMIN_DELETE_STUDENT: (id) => `${API_BASE_URL}/api/admin/delete-student/${id}`,
  ADMIN_EDIT_PARENT: (id) => `${API_BASE_URL}/api/admin/edit-parent/${id}`,
  ADMIN_SETTINGS: `${API_BASE_URL}/api/admin/settings`,
  APP_SETTINGS:   `${API_BASE_URL}/api/app-settings`,
  
  // Teacher endpoints
  TEACHER_PROFILE: (teacherId) => `${API_BASE_URL}/api/teacher/profile?teacher_id=${teacherId}`,
  TEACHER_DASHBOARD_STATS: (teacherId) => `${API_BASE_URL}/api/teacher/dashboard-stats?teacher_id=${teacherId}`,
  TEACHER_ATTENDANCE: `${API_BASE_URL}/api/teacher/attendance`,
  TEACHER_ATTENDANCE_UPDATE: `${API_BASE_URL}/api/teacher/attendance/update`,
  TEACHER_ADD_REVIEW: `${API_BASE_URL}/api/teacher/add-review`,
  TEACHER_GET_REVIEWS: (studentId) => `${API_BASE_URL}/api/teacher/reviews?student_id=${studentId}`,
  TEACHER_UPDATE_REVIEW: (reviewId) => `${API_BASE_URL}/api/teacher/update-review/${reviewId}`,
  TEACHER_GET_REVIEWS: (studentId) => `${API_BASE_URL}/api/teacher/reviews?student_id=${studentId}`,
  TEACHER_UPDATE_REVIEW: (reviewId) => `${API_BASE_URL}/api/teacher/update-review/${reviewId}`,
  TEACHER_REPORTS: `${API_BASE_URL}/api/teacher/reports`,
  TEACHER_ALL_PARENTS: `${API_BASE_URL}/api/teacher/all-parents`,
  TEACHER_ADD_PARENT: `${API_BASE_URL}/api/teacher/add-parent`,
  TEACHER_CHANGE_PASSWORD: (teacherId) => `${API_BASE_URL}/api/teacher/change-password?teacher_id=${teacherId}`,
  TEACHER_CHAT_HISTORY: `${API_BASE_URL}/api/teacher/chat-history`,
  TEACHER_CHAT_SESSION_DETAILS: `${API_BASE_URL}/api/teacher/chat-session-details`,
  TEACHER_ACTIVITY_STATS: `${API_BASE_URL}/api/teacher/activity-stats`,
  
  // Parent endpoints
  PARENT_CHILD_DATA: (parentId) => `${API_BASE_URL}/api/parent/child-data?parent_id=${parentId}`,
  PARENT_MY_CHILDREN: (parentId) => `${API_BASE_URL}/api/parent/my-children/${parentId}`,
  PARENT_CHILD_STARS: (studentId) => `${API_BASE_URL}/api/parent/child-stars?student_id=${studentId}`,
  PARENT_CHECK_ATTENDANCE: (studentId, name) => `${API_BASE_URL}/api/parent/check-attendance?student_id=${studentId}&name=${encodeURIComponent(name)}`,
  PARENT_PROFILE: (parentId) => `${API_BASE_URL}/api/parent/profile?parent_id=${parentId}`,
  PARENT_CHANGE_PASSWORD: (parentId) => `${API_BASE_URL}/api/parent/change-password?parent_id=${parentId}`,
  PARENT_CLASS_LEADERBOARD: `${API_BASE_URL}/api/parent/class-leaderboard`,
  PARENT_CHILD_CHAT_HISTORY: `${API_BASE_URL}/api/parent/child-chat-history`,
  
  // WhatsApp endpoints
  WHATSAPP_DELIVERY_STATS:   `${API_BASE_URL}/api/whatsapp/delivery-stats`,
  WHATSAPP_RECENT_MESSAGES:  `${API_BASE_URL}/api/whatsapp/recent-messages`,
  WHATSAPP_TEMPLATES:        `${API_BASE_URL}/api/whatsapp/templates`,
  WHATSAPP_DELETE_TEMPLATE:  (id) => `${API_BASE_URL}/api/whatsapp/templates/${id}`,
  WHATSAPP_EXPORT_REPORT:    (format) => `${API_BASE_URL}/api/whatsapp/export-delivery-report?format=${format}`,

  // Config endpoints
  CONFIG_BADGES: `${API_BASE_URL}/api/config/badges`,
  CONFIG_LEVELS: `${API_BASE_URL}/api/config/levels`,
  CONFIG_SKILLS: `${API_BASE_URL}/api/config/skills`,

};

export default { API_BASE_URL, API_ENDPOINTS };