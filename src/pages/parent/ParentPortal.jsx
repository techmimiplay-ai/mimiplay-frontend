import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Award, FileText, LogOut, Settings, Gamepad2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, getAuthHeaders } from '../../config';

import ParentHome from '../../components/parent/home/ParentHome';
import ProgressTab from '../../components/parent/progress/ProgressTab';
import AchievementsTab from '../../components/parent/achievements/AchievementsTab';
import ActivityLog from '../../components/parent/activity-log/ActivityLog';
import SettingsTab from '../../components/parent/settings/SettingsTab';
import ParentChildSelector from '../../components/parent/ParentChildSelector';
import PageLoader from '../../components/shared/PageLoader';

const ParentPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyChildren = async () => {
      const parentId = localStorage.getItem('userId');
      if (!parentId) { navigate('/login'); return; }
      try {
        const res = await fetch(`${API_BASE_URL}/api/parent/my-children/${parentId}`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();
        if (res.ok) {
          setChildren(data);
          if (data.length > 0) {
            setSelectedChild(data[0]);
            localStorage.setItem('selectedChild', JSON.stringify(data[0]));
          }
        }
      } catch (err) {
        console.error('Error fetching children:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyChildren();
  }, [navigate]);

  if (loading) return <PageLoader emoji="🌸" text="Loading your portal…" />;

  const tabs = [
    { path: '/parent/home',         icon: Home,      label: 'Home',         color: 'pink'   },
    { path: '/parent/progress',     icon: TrendingUp, label: 'Progress',    color: 'blue'   },
    { path: '/parent/achievements', icon: Award,     label: 'Achievements', color: 'yellow' },
    { path: '/parent/activity-log', icon: FileText,  label: 'Activities',   color: 'green'  },
    { path: '/parent/settings',     icon: Settings,  label: 'Settings',     color: 'purple' },
    { path: '/parent-selection',    icon: Gamepad2,  label: 'Play',         color: 'orange' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleSelectChild = (child) => {
    setSelectedChild(child);
    localStorage.setItem('selectedChild', JSON.stringify(child));
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const getColorClasses = (color, active) => {
    const colors = {
      pink:   active ? 'bg-pink-400 text-white shadow-pink-200'     : 'bg-pink-100 text-pink-700 hover:bg-pink-200',
      blue:   active ? 'bg-blue-400 text-white shadow-blue-200'     : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      yellow: active ? 'bg-yellow-400 text-white shadow-yellow-200' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      green:  active ? 'bg-green-400 text-white shadow-green-200'   : 'bg-green-100 text-green-700 hover:bg-green-200',
      purple: active ? 'bg-purple-400 text-white shadow-purple-200' : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      orange: active ? 'bg-orange-400 text-white shadow-orange-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
    };
    return colors[color] || colors.pink;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-x-hidden">

      {/* Top Bar — matches Teacher/Admin style */}
      <header className="bg-white/80 backdrop-blur-lg border-b-4 border-purple-200 px-4 md:px-8 py-3 md:py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between max-w-[1920px] mx-auto">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-2xl md:text-4xl font-display font-bold text-gradient select-none">Alexi</h1>
            <span className="hidden xs:inline-block px-2 md:px-4 py-1 bg-pink-100 text-pink-700 rounded-xl md:rounded-2xl text-[10px] md:text-sm font-bold">
              Parent Portal 👨‍👩‍👧
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <ParentChildSelector
              childrenList={children}
              selectedChild={selectedChild}
              onSelectChild={handleSelectChild}
            />
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

      {/* Tab Navigation — matches Teacher/Admin style */}
      <nav className="bg-white/60 backdrop-blur-md border-b-4 border-pink-200 px-4 md:px-8 py-3 sticky top-[68px] md:top-[84px] z-40">
        <div className="flex items-center gap-2 md:gap-3 max-w-[1920px] mx-auto overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <motion.button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  flex items-center gap-2 md:gap-3 px-4 md:px-6 py-2.5 md:py-3
                  rounded-xl md:rounded-2xl font-bold transition-all whitespace-nowrap text-sm md:text-base shrink-0
                  ${getColorClasses(tab.color, active)}
                  ${active ? 'shadow-lg translate-y-[-1px]' : 'shadow-sm'}
                `}
              >
                <Icon size={18} className="md:w-5 md:h-5" />
                <span>{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </nav>

      {/* Main Content */}
      <main className="px-4 md:px-8 py-6 md:py-8 max-w-[1920px] mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            <Routes>
              <Route path="/" element={<Navigate to="home" replace />} />
              <Route path="home"         element={<ParentHome selectedChild={selectedChild} />} />
              <Route path="progress"     element={<ProgressTab selectedChild={selectedChild} />} />
              <Route path="achievements" element={<AchievementsTab selectedChild={selectedChild} />} />
              <Route path="activity-log" element={<ActivityLog selectedChild={selectedChild} />} />
              <Route path="settings"     element={<SettingsTab />} />
            </Routes>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default ParentPortal;
