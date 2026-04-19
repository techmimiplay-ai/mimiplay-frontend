import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'
import ErrorBoundary from './components/shared/ErrorBoundary.jsx'
import { ToastProvider } from './context/ToastContext.jsx'

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
    if ((status === 401 || status === 403) && !isPublicApiRequest(error.config?.url)) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Global fetch wrapper — injects auth token and handles 401/403
const originalFetch = window.fetch;
window.fetch = (input, init = {}) => {
  const url   = typeof input === 'string' ? input : input?.url ?? '';
  const token = localStorage.getItem('token');

  if (!token && !isPublicApiRequest(url)) {
    window.location.href = '/login';
    return Promise.reject(new Error('No token'));
  }

  if (token) {
    const headers = new Headers(init.headers || {});
    if (!headers.has('Authorization')) headers.set('Authorization', `Bearer ${token}`);
    init = { ...init, headers };
  }

  return originalFetch(input, init).then(response => {
    if ((response.status === 401 || response.status === 403) && !isPublicApiRequest(url)) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return response;
  });
};

createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <ToastProvider>
      <App />
    </ToastProvider>
  </ErrorBoundary>
)