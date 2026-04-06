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
export const API_BASE_URL = import.meta.env.VITE_API_URL;

// ✅ Token helper
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  };
};

export const API_ENDPOINTS = {
  GET_STATUS:           `${API_BASE_URL}/get-status`,
  START_CLASSROOM:      `${API_BASE_URL}/start-classroom`,
  START_MIMI_SESSION:   `${API_BASE_URL}/start-mimi-session`,
  GET_MIMI_STATUS:      `${API_BASE_URL}/mimi-get`,
  ACTIVITY_CHECK:       `${API_BASE_URL}/activity-check`,
  ACTIVITY_EVALUATE:    `${API_BASE_URL}/activity-evaluate`,
  ACTIVITY_SAVE_STARS:  `${API_BASE_URL}/activity-save-stars`,
  ACTIVITY_GET_STARS:   (studentId) => `${API_BASE_URL}/activity-get-stars/${studentId}`,
  GENERATE_QUESTIONS:   `${API_BASE_URL}/generate-activity-questions`,  // ← NEW: LLM questions for activities 9-12
  START_FACE_DETECT:    `${API_BASE_URL}/start-face-detect`,              // ← face detect only, no attendance
  STOP_FACE_DETECT:     `${API_BASE_URL}/stop-face-detect`,
  PROCESS_FRAME:        `${API_BASE_URL}/process-frame`,                  // ← NEW: send frame for recognition
  REGISTER_FACE:       `${API_BASE_URL}/register-face`,        // ← NEW: save new student face
  GET_STUDENT_ID:       `${API_BASE_URL}/get-student-id-by-name`,  // ← YE ADD KARO
  SPEAK:                `${API_BASE_URL}/speak`,                           // ← NEW: backend voice synthesis
  // MIMI_SAVE_CHAT:    `${API_BASE_URL}/api/mimi/save-chat`,
  MIMI_CHAT_HISTORY: `${API_BASE_URL}/api/mimi/chat-history`,
  MIMI_STOP_SESSION: `${API_BASE_URL}/api/mimi/stop-session`,
  MIMI_CHAT:         `${API_BASE_URL}/mimi-chat`,
  MIMI_WAKE:         `${API_BASE_URL}/mimi-wake`,
  MIMI_CHAT_AUDIO:   `${API_BASE_URL}/mimi-chat-audio`,
  MIMI_SAVE_CHAT: `${API_BASE_URL}/mimi-save-chat`,
};

export default { API_BASE_URL, API_ENDPOINTS };