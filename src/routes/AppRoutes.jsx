import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import { Login, Register, ForgotPassword } from '../pages';

// Student/TV Interface
import MimiChat from '../pages/MimiChat';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherSelection from '../pages/teacher/TeacherSelection';

// Parent Pages
import ParentPortal from '../pages/parent/ParentPortal';
import ParentSelection from '../pages/parent/ParentSelection';
import ParentActivities  from '../pages/parent/ParentActivities';

// Admin Pages
import AdminPanel from '../pages/admin/AdminPanel';

// 404
import NotFound from '../pages/NotFound';

const ProtectedRoute = ({ element, allowedRoles }) => {
  const token = localStorage.getItem('token');
  const role  = localStorage.getItem('role');

  if (!token) return <Navigate to="/login" replace />;

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Redirect to the user's own portal instead of login
    const home = role === 'teacher' ? '/teacher/home'
               : role === 'parent'  ? '/parent/home'
               : role === 'admin'   ? '/admin/dashboard'
               : '/login';
    return <Navigate to={home} replace />;
  }

  return element;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      
      {/* Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Student/TV Interface (Mimi) */}
      <Route path="/mimi-chat" element={<ProtectedRoute element={<MimiChat />} />} />
      
      {/* Teacher Dashboard */}
      {/* <Route path="/teacher/*" element={<TeacherDashboard />} /> */}
      {/* <Route path="/teacher/selection" element={<TeacherSelection />} /> */}
      <Route path="/teacher/*"         element={<ProtectedRoute element={<TeacherDashboard />} allowedRoles={['teacher', 'admin']} />} />
      <Route path="/teacher/selection" element={<ProtectedRoute element={<TeacherSelection />} allowedRoles={['teacher', 'admin']} />} />
      
      {/* Parent Portal */}
      {/* <Route path="/parent/*" element={<ParentPortal />} />
      <Route path="/parent-selection" element={<ParentSelection />} />
      <Route path="/parent/activities" element={<ParentActivities />} /> */}
       <Route path="/parent/*"          element={<ProtectedRoute element={<ParentPortal />}    allowedRoles={['parent']} />} />
      <Route path="/parent-selection"  element={<ProtectedRoute element={<ParentSelection />} allowedRoles={['parent']} />} />
      <Route path="/parent/activities" element={<ProtectedRoute element={<ParentActivities />} allowedRoles={['parent']} />} />

      
      {/* Admin Panel */}
      {/* <Route path="/admin/*" element={<AdminPanel />} /> */}
      <Route path="/admin/*" element={<ProtectedRoute element={<AdminPanel />} allowedRoles={['admin']} />} />

      
      {/* 404 Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;