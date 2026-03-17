import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Users, BarChart, CheckSquare, BookOpen, Settings } from 'lucide-react';

const TeacherSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/teacher/home', icon: Home, label: 'Dashboard' },
    { path: '/teacher/students', icon: Users, label: 'Students' },
    { path: '/teacher/activities', icon: BookOpen, label: 'Activities' },
    { path: '/teacher/attendance', icon: CheckSquare, label: 'Attendance' },
    { path: '/teacher/reports', icon: BarChart, label: 'Reports' },
    { path: '/teacher/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="space-y-2">
      {menuItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        
        return (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`
              w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-colors
              ${isActive 
                ? 'bg-primary-50 text-primary-600' 
                : 'text-text hover:bg-gray-50'
              }
            `}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default TeacherSidebar;