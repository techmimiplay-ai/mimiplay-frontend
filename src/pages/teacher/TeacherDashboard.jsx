import React, { useState } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, BarChart, CheckSquare, BookOpen, Settings, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';

// Teacher Pages
import TeacherHome from '../../components/teacher/dashboard/TeacherHome';
import StudentList from '../../components/teacher/students/StudentList';
import ReportsTab from '../../components/teacher/reports/ReportsTab';
import AttendanceTab from '../../components/teacher/attendance/AttendanceTab';
import ActivitiesTab from '../../components/teacher/activities/ActivitiesTab';
import SettingsTab from '../../components/teacher/settings/SettingsTab';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { path: '/teacher/home', icon: Home, label: 'Home', color: 'pink' },
    { path: '/teacher/students', icon: Users, label: 'Students', color: 'blue' },
    { path: '/teacher/activities', icon: BookOpen, label: 'Activities', color: 'green' },
    { path: '/teacher/attendance', icon: CheckSquare, label: 'Attendance', color: 'yellow' },
    { path: '/teacher/reports', icon: BarChart, label: 'Reports', color: 'orange' },
    { path: '/teacher/settings', icon: Settings, label: 'Settings', color: 'gray' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleTabClick = (tab) => {
    navigate(tab.path);
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      navigate('/login');
    }
  };

  const getColorClasses = (color, active) => {
    const colors = {
      pink: active ? 'bg-pink-400 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200',
      purple: active ? 'bg-purple-400 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      blue: active ? 'bg-blue-400 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: active ? 'bg-green-400 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
      yellow: active ? 'bg-yellow-400 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      orange: active ? 'bg-orange-400 text-white' : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      gray: active ? 'bg-gray-400 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Top Bar - Full Width */}
      <div className="bg-white/80 backdrop-blur-lg border-b-4 border-purple-200 px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-4xl font-display font-bold text-gradient">Alexi</h1>
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-2xl text-sm font-bold">
              Teacher Portal 👩‍🏫
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-bold text-text">Mrs. Priya Singh</p>
              <p className="text-sm text-text/60">Junior KG-A</p>
            </div>
            <button
              onClick={() => navigate('/mimi-chat')}
              className="p-3 bg-indigo-100 hover:bg-indigo-200 rounded-2xl transition-colors mr-2"
              title="Mimi Chat"
            >
              <span className="text-indigo-600 font-bold">Mimi Chat</span>
            </button>
            <button
              onClick={handleLogout}
              className="p-3 bg-red-100 hover:bg-red-200 rounded-2xl transition-colors group"
              title="Logout"
            >
              <LogOut size={20} className="text-red-600 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>

      {/* Floating Tab Navigation - Full Width */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b-4 border-pink-200 px-8 py-4">
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            
            return (
              <motion.button
                key={tab.path}
                onClick={() => handleTabClick(tab)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex items-center gap-3 px-6 py-3 rounded-2xl font-bold transition-all
                  ${getColorClasses(tab.color, active)}
                  ${active ? 'shadow-lg' : 'shadow-md'}
                  whitespace-nowrap
                `}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Main Content - Full Width */}
      <div className="px-8 py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="home" replace />} />
            <Route path="home" element={<TeacherHome />} />
            <Route path="students" element={<StudentList />} />
            <Route path="reports" element={<ReportsTab />} />
            <Route path="attendance" element={<AttendanceTab />} />
            <Route path="activities" element={<ActivitiesTab />} />
            <Route path="settings" element={<SettingsTab />} />
          </Routes>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;