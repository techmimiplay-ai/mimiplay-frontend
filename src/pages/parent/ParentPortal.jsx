

// import React, { useState, useEffect } from 'react';
// import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
// import { Home, TrendingUp, Award, FileText, LogOut, Settings } from 'lucide-react';
// import { motion } from 'framer-motion';
// import { API_BASE_URL } from '../../config';

// // Parent Pages
// import ParentHome from '../../components/parent/home/ParentHome';
// import ProgressTab from '../../components/parent/progress/ProgressTab';
// import AchievementsTab from '../../components/parent/achievements/AchievementsTab';
// import ActivityLog from '../../components/parent/activity-log/ActivityLog';
// import SettingsTab from '../../components/parent/settings/SettingsTab';
// import ParentChildSelector from '../../components/parent/ParentChildSelector';

// const ParentPortal = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [children, setChildren] = useState([]);
//   const [selectedChild, setSelectedChild] = useState(null);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const fetchMyChildren = async () => {
//       // Login ke waqt aapne 'userId' store kiya hoga localStorage mein
//       const parentId = localStorage.getItem('userId');

//       if (!parentId) {
//         navigate('/login');
//         return;
//       }

//       try {
//         const res = await fetch(`${API_BASE_URL}/api/parent/my-children/${parentId}`);
//         const data = await res.json();

//         if (res.ok) {
//           setChildren(data);
//           if (data.length > 0) {
//             setSelectedChild(data[0]); // Pehle bachhe ko default select karo
//           }
//         }
//       } catch (err) {
//         console.error("Error fetching children:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchMyChildren();
//   }, [navigate]);

//   if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

//   const tabs = [
//     { path: '/parent/home', icon: Home, label: 'Home', emoji: '🏠', color: 'pink' },
//     { path: '/parent/progress', icon: TrendingUp, label: 'Progress', emoji: '📈', color: 'blue' },
//     { path: '/parent/achievements', icon: Award, label: 'Achievements', emoji: '🏆', color: 'yellow' },
//     { path: '/parent/activity-log', icon: FileText, label: 'Activities', emoji: '📚', color: 'green' },
//     { path: '/parent/settings', icon: Settings, label: 'Settings', emoji: '⚙️', color: 'purple' },
//   ];

//   const isActive = (path) => location.pathname === path;

//   const handleLogout = () => {
//     if (window.confirm('Are you sure you want to logout?')) {
//       navigate('/login');
//     }
//   };

//   const getColorClasses = (color, active) => {
//     const colors = {
//       pink: active ? 'bg-pink-400 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200',
//       blue: active ? 'bg-blue-400 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
//       yellow: active ? 'bg-yellow-400 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
//       green: active ? 'bg-green-400 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
//       purple: active ? 'bg-purple-400 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
//     };
//     return colors[color];
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
//       {/* Top Bar - Full Width */}
//       <div className="bg-white/80 backdrop-blur-lg border-b-4 border-pink-200 px-4 sm:px-4 md:px-6 lg:px-8 py-3 sm:py-3 md:py-4 lg:py-4">
//         <div className="flex items-center justify-between gap-2">
//           <div className="flex items-center gap-2 sm:gap-2 md:gap-3 lg:gap-4 min-w-0">
//             <h1 className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl font-display font-bold text-gradient shrink-0">Alexi</h1>
//             <span className="px-2 sm:px-2 md:px-3 lg:px-4 py-1 sm:py-1 md:py-2 lg:py-2 bg-pink-100 text-pink-700 rounded-2xl text-xs sm:text-xs md:text-sm lg:text-sm font-bold whitespace-nowrap">
//               Parent Portal 👨‍👩‍👧
//             </span>
//           </div>
//           <div className="flex items-center gap-2 sm:gap-2 md:gap-3 lg:gap-4 shrink-0">
//             {/* Parent Child Selector */}
//             <ParentChildSelector
//               childrenList={children}
//               selectedChild={selectedChild}
//               onSelectChild={setSelectedChild}
//             />
//             <button
//               onClick={handleLogout}
//               className="p-2 sm:p-2 md:p-3 lg:p-3 bg-red-100 hover:bg-red-200 rounded-2xl transition-colors"
//             >
//               <LogOut size={18} className="text-red-600" />
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Floating Tab Navigation - Centered */}
//       <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b-4 border-purple-200 px-2 sm:px-2 md:px-4 lg:px-8 py-2 sm:py-2 md:py-3 lg:py-4 overflow-x-auto">
//         <div className="flex items-center justify-start sm:justify-start md:justify-center lg:justify-center gap-2 sm:gap-2 md:gap-3 lg:gap-4 min-w-max sm:min-w-max md:min-w-0 lg:min-w-0 mx-auto">
//           {tabs.map((tab) => {
//             const Icon = tab.icon;
//             const active = isActive(tab.path);

//             return (
//               <motion.button
//                 key={tab.path}
//                 onClick={() => navigate(tab.path)}
//                 whileHover={{ scale: 1.05, y: -2 }}
//                 whileTap={{ scale: 0.95 }}
//                 className={`
//                   flex flex-col items-center gap-1 sm:gap-1 md:gap-1 lg:gap-2
//                   px-3 sm:px-3 md:px-5 lg:px-8
//                   py-2 sm:py-2 md:py-3 lg:py-4
//                   rounded-3xl font-bold transition-all shrink-0
//                   ${getColorClasses(tab.color, active)}
//                   ${active ? 'shadow-lg' : 'shadow-md'}
//                 `}
//               >
//                 <div className="text-2xl sm:text-2xl md:text-3xl lg:text-4xl">{tab.emoji}</div>
//                 <div className="flex items-center gap-1">
//                   <Icon size={14} className="sm:w-4 sm:h-4 md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" />
//                   <span className="text-xs sm:text-xs md:text-sm lg:text-base">{tab.label}</span>
//                 </div>
//               </motion.button>
//             );
//           })}
//         </div>
//       </div>

//       {/* Main Content - Full Width */}
//       <div className="px-4 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-6 md:py-7 lg:py-8">
//         <motion.div
//           key={location.pathname}
//           initial={{ opacity: 0, y: 20 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ duration: 0.3 }}
//         >
//           <Routes>
//             <Route path="/" element={<Navigate to="home" replace />} />
//             <Route path="home" element={<ParentHome selectedChild={selectedChild}  />} />
//             <Route path="progress" element={<ProgressTab selectedChild={selectedChild} />} />
//             <Route path="achievements" element={<AchievementsTab selectedChild={selectedChild} />}  />
//             <Route path="activity-log" element={<ActivityLog selectedChild={selectedChild}/>} />
//             <Route path="settings" element={<SettingsTab />} />
//           </Routes>
//         </motion.div>
//       </div>
//     </div>
//   );
// };

// export default ParentPortal;


import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Home, TrendingUp, Award, FileText, LogOut, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
// import { API_BASE_URL } from '../../config';
import { API_BASE_URL, getAuthHeaders } from '../../config';


// Parent Pages
import ParentHome from '../../components/parent/home/ParentHome';
import ProgressTab from '../../components/parent/progress/ProgressTab';
import AchievementsTab from '../../components/parent/achievements/AchievementsTab';
import ActivityLog from '../../components/parent/activity-log/ActivityLog';
import SettingsTab from '../../components/parent/settings/SettingsTab';
import ParentChildSelector from '../../components/parent/ParentChildSelector';

const ParentPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMyChildren = async () => {
      const parentId = localStorage.getItem('userId');

      if (!parentId) {
        navigate('/login');
        return;
      }

      try {
        // const res = await fetch(`${API_BASE_URL}/api/parent/my-children/${parentId}`);
        const res = await fetch(`${API_BASE_URL}/api/parent/my-children/${parentId}`, {
          headers: getAuthHeaders()
        });
        const data = await res.json();

        if (res.ok) {
          setChildren(data);
          if (data.length > 0) {
            setSelectedChild(data[0]);
          }
        }
      } catch (err) {
        console.error("Error fetching children:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyChildren();
  }, [navigate]);

  if (loading) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  const tabs = [
    { path: '/parent/home', icon: Home, label: 'Home', emoji: '🏠', color: 'pink' },
    { path: '/parent/progress', icon: TrendingUp, label: 'Progress', emoji: '📈', color: 'blue' },
    { path: '/parent/achievements', icon: Award, label: 'Achievements', emoji: '🏆', color: 'yellow' },
    { path: '/parent/activity-log', icon: FileText, label: 'Activities', emoji: '📚', color: 'green' },
    { path: '/parent/settings', icon: Settings, label: 'Settings', emoji: '⚙️', color: 'purple' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      navigate('/login');
    }
  };

  const getColorClasses = (color, active) => {
    const colors = {
      pink: active ? 'bg-pink-400 text-white' : 'bg-pink-100 text-pink-700 hover:bg-pink-200',
      blue: active ? 'bg-blue-400 text-white' : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      yellow: active ? 'bg-yellow-400 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      green: active ? 'bg-green-400 text-white' : 'bg-green-100 text-green-700 hover:bg-green-200',
      purple: active ? 'bg-purple-400 text-white' : 'bg-purple-100 text-purple-700 hover:bg-purple-200',
    };
    return colors[color];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Top Bar */}
      <div className="bg-white/80 backdrop-blur-lg border-b-4 border-pink-200 px-4 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 min-w-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-display font-bold text-gradient shrink-0">Alexi</h1>
            <span className="px-2 md:px-3 lg:px-4 py-1 md:py-2 bg-pink-100 text-pink-700 rounded-2xl text-xs md:text-sm font-bold whitespace-nowrap">
              Parent Portal 👨‍👩‍👧
            </span>
          </div>
          <div className="flex items-center gap-2 md:gap-3 lg:gap-4 shrink-0">
            <ParentChildSelector
              childrenList={children}
              selectedChild={selectedChild}
              onSelectChild={setSelectedChild}
            />
            <button
              onClick={handleLogout}
              className="p-2 md:p-3 bg-red-100 hover:bg-red-200 rounded-2xl transition-colors"
            >
              <LogOut size={18} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b-4 border-purple-200 px-2 md:px-4 lg:px-8 py-2 md:py-3 lg:py-4">

        {/* Mobile (SM): 3 column grid - no scroll */}
        <div className="grid grid-cols-3 gap-2 sm:hidden">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <motion.button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex flex-col items-center gap-1 px-2 py-2 rounded-3xl font-bold transition-all
                  ${getColorClasses(tab.color, active)}
                  ${active ? 'shadow-lg' : 'shadow-md'}
                `}
              >
                <div className="text-xl">{tab.emoji}</div>
                <span className="text-xs">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>

        {/* Tablet & Desktop (SM+): Normal flex row */}
        <div className="hidden sm:flex items-center justify-center gap-2 md:gap-3 lg:gap-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <motion.button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  flex flex-col items-center gap-1 md:gap-1 lg:gap-2
                  px-5 md:px-5 lg:px-8
                  py-2 md:py-3 lg:py-4
                  rounded-3xl font-bold transition-all shrink-0
                  ${getColorClasses(tab.color, active)}
                  ${active ? 'shadow-lg' : 'shadow-md'}
                `}
              >
                <div className="text-2xl md:text-3xl lg:text-4xl">{tab.emoji}</div>
                <div className="flex items-center gap-1">
                  <Icon size={14} className="md:w-4 md:h-4 lg:w-[18px] lg:h-[18px]" />
                  <span className="text-xs md:text-sm lg:text-base">{tab.label}</span>
                </div>
              </motion.button>
            );
          })}
        </div>

      </div>

      {/* Main Content */}
      <div className="px-4 md:px-6 lg:px-8 py-6 md:py-7 lg:py-8">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="home" replace />} />
            <Route path="home" element={<ParentHome selectedChild={selectedChild} />} />
            <Route path="progress" element={<ProgressTab selectedChild={selectedChild} />} />
            <Route path="achievements" element={<AchievementsTab selectedChild={selectedChild} />} />
            <Route path="activity-log" element={<ActivityLog selectedChild={selectedChild} />} />
            <Route path="settings" element={<SettingsTab />} />
          </Routes>
        </motion.div>
      </div>
    </div>
  );
};

export default ParentPortal;