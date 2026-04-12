import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, BarChart, CheckSquare, BookOpen, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL } from '../../config';

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
  const [teacherProfile, setTeacherProfile] = useState({ name: 'Teacher', class: 'Class' });

  const teacherId = localStorage.getItem('userId') || localStorage.getItem('user_id');

  useEffect(() => {
    if (!teacherId) return;
    fetchTeacherProfile();
  }, [teacherId]);

  const fetchTeacherProfile = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/teacher/profile?teacher_id=${teacherId}`);
      if (res.data?.status === 'success') {
        const p = res.data.profile;
        setTeacherProfile({
          name: p.fullName || p.name || 'Teacher',
          class: p.class || 'Class'
        });
      }
    } catch (err) {
      console.error('Teacher profile fetch error:', err);
    }
  };

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
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const getColorClasses = (color, active) => {
    const colors = {
      pink: active ? 'bg-pink-400 text-white shadow-pink-200' : 'bg-pink-100 text-pink-700 hover:bg-pink-200',
      blue: active ? 'bg-blue-400 text-white shadow-blue-200' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      green: active ? 'bg-green-400 text-white shadow-green-200' : 'bg-green-100 text-green-700 hover:bg-green-200',
      yellow: active ? 'bg-yellow-400 text-white shadow-yellow-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      orange: active ? 'bg-orange-400 text-white shadow-orange-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
      gray: active ? 'bg-gray-400 text-white shadow-gray-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    };
    return colors[color] || colors.gray;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-x-hidden">

      {/* --- Top Bar --- */}
      <header className="bg-white/80 backdrop-blur-lg border-b-4 border-purple-200 px-4 md:px-8 py-3 md:py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto">
          {/* Logo Section */}
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-2xl md:text-4xl font-display font-bold text-gradient select-none">Alexi</h1>
            <span className="hidden xs:inline-block px-2 md:px-4 py-1 bg-purple-100 text-purple-700 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-bold">
              Teacher Portal 👩‍🏫
            </span>
          </div>

          {/* Actions Section */}
          <div className="flex items-center gap-2 md:gap-4">
            {/* Profile Info - Desktop Only */}
            <div className="hidden lg:block text-right border-r-2 border-gray-100 pr-4 mr-2">
              <p className="font-bold text-text text-sm">{teacherProfile.name}</p>
              <p className="text-xs text-text/60">{teacherProfile.class}</p>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="p-2 md:p-3 bg-red-100 hover:bg-red-500 hover:text-white text-red-600 rounded-xl md:rounded-2xl transition-all duration-300 group shadow-sm"
              title="Logout"
            >
              <LogOut size={20} className="md:w-5 md:h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </header>

      {/* --- Navigation Tabs --- */}
      <nav className="bg-white/60 backdrop-blur-md border-b-4 border-pink-200 px-4 md:px-8 py-3 sticky top-[68px] md:top-[84px] z-40">

        {/* Mobile (SM): Row 1 - 3 tabs + Mimi Chat after Activities */}
        <div className="flex gap-2 sm:hidden mb-2">
          {tabs.slice(0, 3).map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <motion.button
                key={tab.path}
                onClick={() => handleTabClick(tab)}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-2 rounded-xl font-bold transition-all text-xs
                  ${getColorClasses(tab.color, active)}
                  ${active ? 'shadow-lg' : 'shadow-sm'}
                `}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
          <motion.button
            onClick={() => navigate('/mimi-chat')}
            whileTap={{ scale: 0.98 }}
            className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl font-bold transition-all text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow-sm"
          >
            <span>🤖</span>
            <span>Mimi</span>
          </motion.button>
        </div>

        {/* Mobile (SM): Row 2 - 3 tabs */}
        <div className="flex gap-2 sm:hidden">
          {tabs.slice(3).map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <motion.button
                key={tab.path}
                onClick={() => handleTabClick(tab)}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex-1 flex flex-col items-center gap-1 py-2 rounded-xl font-bold transition-all text-xs
                  ${getColorClasses(tab.color, active)}
                  ${active ? 'shadow-lg' : 'shadow-sm'}
                `}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Tablet & Desktop (SM+): Normal flex row */}
        <div className="hidden sm:flex items-center gap-2 md:gap-3 max-w-[1920px] mx-auto">
          {tabs.map((tab, idx) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <React.Fragment key={tab.path}>
                <motion.button
                  onClick={() => handleTabClick(tab)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`
                    flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all whitespace-nowrap text-sm md:text-base
                    ${getColorClasses(tab.color, active)}
                    ${active ? 'shadow-lg translate-y-[-1px]' : 'shadow-sm'}
                  `}
                >
                  <Icon size={18} className="md:w-5 md:h-5" />
                  <span>{tab.label}</span>
                </motion.button>
                {tab.path === '/teacher/activities' && (
                  <motion.button
                    onClick={() => navigate('/mimi-chat')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-bold transition-all whitespace-nowrap text-sm md:text-base bg-indigo-100 text-indigo-700 hover:bg-indigo-200 shadow-sm"
                  >
                    <span>🤖</span>
                    <span>Mimi Chat</span>
                  </motion.button>
                )}
              </React.Fragment>
            );
          })}
        </div>

      </nav>

      {/* --- Main Content Area --- */}
      <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
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
        </AnimatePresence>
      </main>
    </div>
  );
};

export default TeacherDashboard;