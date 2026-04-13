import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, UserPlus, Settings, LogOut, GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';

// Admin Pages
import AdminDashboard from '../../components/admin/dashboard/AdminDashboard';
import TeacherManagement from '../../components/admin/teachers/TeacherManagement';
import ParentManagement from '../../components/admin/parents/ParentManagement';
import StudentManagement from '../../components/admin/students/StudentManagement';
import SystemSettings from '../../components/admin/settings/SystemSettings';

const AdminPanel = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard', color: 'purple' },
    { path: '/admin/teachers', icon: Users, label: 'Teachers', color: 'blue' },
    { path: '/admin/parents', icon: UserPlus, label: 'Parents', color: 'green' },
    { path: '/admin/students', icon: GraduationCap, label: 'Students', color: 'orange' },
    { path: '/admin/settings', icon: Settings, label: 'Settings', color: 'gray' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const getColorClasses = (color, active) => {
    const colors = {
      purple: active ? 'bg-purple-500 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      blue: active ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: active ? 'bg-green-500 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
      orange: active ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      gray: active ? 'bg-gray-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Bar */}
      <header className="bg-white/80 backdrop-blur-lg border-b-4 border-purple-200 px-4 sm:px-6 lg:px-8 py-3 md:py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-2xl md:text-4xl font-display font-bold text-gradient">Alexi</h1>
            <span className="hidden xs:inline-block px-2 md:px-4 py-1 bg-purple-100 text-purple-700 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-bold">
              Admin Panel 🛡️
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="p-2 md:p-3 bg-red-100 hover:bg-red-500 hover:text-white text-red-600 rounded-xl md:rounded-2xl transition-all duration-300 group shadow-sm"
            title="Logout"
          >
            <LogOut size={20} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </header>

      {/* Tab Navigation */}
      <nav className="bg-white/60 backdrop-blur-md border-b-4 border-gray-200 px-4 sm:px-6 lg:px-8 py-3 sticky top-[60px] md:top-[72px] z-40">
        {/* Mobile: 3 column grid (2 rows) */}
        <div className="grid grid-cols-3 gap-2 sm:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`
                  flex flex-col items-center gap-1 px-2 py-2 rounded-xl font-semibold transition-all text-center
                  ${getColorClasses(tab.color, active)}
                `}
              >
                <Icon size={18} />
                <span className="text-xs">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tablet & Desktop: Normal flex row */}
        <div className="hidden sm:flex items-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className={`
                  flex items-center gap-2 px-4 lg:px-6 py-3 rounded-xl font-semibold transition-all whitespace-nowrap
                  ${getColorClasses(tab.color, active)}
                `}
              >
                <Icon size={18} />
                <span className="text-sm sm:text-base">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Routes>
          <Route path="/" element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="teachers" element={<TeacherManagement />} />
          <Route path="parents" element={<ParentManagement />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="settings" element={<SystemSettings />} />
        </Routes>
      </div>
    </div>
  );
};

export default AdminPanel;