import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'

const isPublicApiRequest = (url) => {
  if (!url) return false;
  const normalized = url.toString().toLowerCase();
  return [
    '/api/login',
    '/api/register',
    '/api/forgot-password',
    '/api/password-reset',
    '/api/auth',
    '/api/public',
    '/auth',
  ].some(path => normalized.includes(path));
};

// ✅ Axios Interceptor — har API call mein automatically token jayega
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    // If no token and request is not an auth/public endpoint, redirect.
    if (!token && !isPublicApiRequest(config.url)) {
      window.location.href = '/login';
      return Promise.reject(new Error('No token found, redirecting to login'));
    }

    if (token) {
      config.headers = config.headers || {};
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    if (status === 401 || status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Global fetch wrapper for token check + redirect
const originalFetch = window.fetch;
window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input?.url;
  const token = localStorage.getItem('token');

  if (!token && !isPublicApiRequest(url)) {
    window.location.href = '/login';
    return Promise.reject(new Error('No token found, redirecting to login'));
  }

  if (token) {
    init.headers = init.headers || {};
    if (init.headers instanceof Headers) {
      init.headers.set('Authorization', `Bearer ${token}`);
    } else if (Array.isArray(init.headers)) {
      const existing = Object.fromEntries(init.headers);
      existing['Authorization'] = `Bearer ${token}`;
      init.headers = existing;
    } else {
      init.headers = { ...init.headers, Authorization: `Bearer ${token}` };
    }
  }

  const response = await originalFetch(input, init);

  if (response.status === 401 || response.status === 403) {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    window.location.href = '/login';
  }

  return response;
};

createRoot(document.getElementById('root')).render(
    <App />
)