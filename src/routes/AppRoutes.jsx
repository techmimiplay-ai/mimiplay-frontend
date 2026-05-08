import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ErrorBoundary from '../components/shared/ErrorBoundary';

// Auth Pages
import { Login, Register, ForgotPassword, ResetPassword } from '../pages';

// Shared screens — all roles
import SelectionScreen  from '../pages/SelectionScreen';
import MimiChat         from '../pages/MimiChat';
import ActivitiesScreen from '../pages/ActivitiesScreen';


// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';

// Parent Pages
import ParentPortal  from '../pages/parent/ParentPortal';

// Admin Pages
import AdminPanel from '../pages/admin/AdminPanel';

// 404
import NotFound from '../pages/NotFound';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    const home = role === 'teacher' ? '/teacher/home'
               : role === 'parent'  ? '/parent/home'
               : role === 'admin'   ? '/admin/dashboard'
               : '/login';
    return <Navigate to={home} replace />;
  }

  return element;
};

// Redirects logged-in users away from auth pages back to their portal
const PublicRoute = ({ element }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  if (token) {
    const home = role === 'teacher' ? '/teacher/home'
               : role === 'parent'  ? '/parent/home'
               : role === 'admin'   ? '/admin/dashboard'
               : '/select';
    return <Navigate to={home} replace />;
  }

  return element;
};

const AppRoutes = () => {
  return (
    <ErrorBoundary>
      <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* Auth Routes — redirect to portal if already logged in */}
      <Route path="/login"           element={<PublicRoute element={<Login />} />} />
      <Route path="/register"        element={<PublicRoute element={<Register />} />} />
      <Route path="/forgot-password" element={<PublicRoute element={<ForgotPassword />} />} />
      <Route path="/reset-password"  element={<PublicRoute element={<ResetPassword />} />} />

      {/* ── Shared screens — teacher + parent + admin ── */}
      <Route path="/select"      element={<ProtectedRoute element={<SelectionScreen />}  allowedRoles={['teacher','parent','admin']} />} />
      <Route path="/chat"        element={<ProtectedRoute element={<MimiChat />}         allowedRoles={['teacher','parent','admin']} />} />
      <Route path="/activities"  element={<ProtectedRoute element={<ActivitiesScreen />} allowedRoles={['teacher','parent','admin']} />} />

      {/* Legacy paths — redirect to unified routes so old bookmarks still work */}
      <Route path="/teacher/selection" element={<ProtectedRoute element={<Navigate to="/select" replace />}     allowedRoles={['teacher','admin']} />} />
      <Route path="/parent-selection"  element={<ProtectedRoute element={<Navigate to="/select" replace />}     allowedRoles={['parent','admin']} />} />
      <Route path="/mimi-chat"         element={<ProtectedRoute element={<Navigate to="/chat" replace />}        allowedRoles={['teacher','parent','admin']} />} />


      {/* Teacher Dashboard */}
      <Route path="/teacher/*" element={<ProtectedRoute element={<TeacherDashboard />} allowedRoles={['teacher','admin']} />} />

      {/* Parent Portal */}
      <Route path="/parent/*" element={<ProtectedRoute element={<ParentPortal />} allowedRoles={['parent','admin']} />} />

      {/* Admin Panel */}
      <Route path="/admin/*" element={<ProtectedRoute element={<AdminPanel />} allowedRoles={['admin']} />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
};

export default AppRoutes;