import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Award, FileText } from 'lucide-react';

const ParentSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { path: '/parent/home', icon: Home, label: 'Home' },
    { path: '/parent/progress', icon: TrendingUp, label: 'Progress' },
    { path: '/parent/achievements', icon: Award, label: 'Achievements' },
    { path: '/parent/activity-log', icon: FileText, label: 'Activity Log' },
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

export default ParentSidebar;