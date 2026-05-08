/**
 * SelectionScreen.jsx
 * Single selection screen for teacher, parent and admin.
 * Replaces TeacherSelection.jsx and ParentSelection.jsx.
 *
 * mode is derived from localStorage role — no prop needed.
 * Navigates to /chat and /activities with mode passed via location state.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, PlayCircle, Lock } from 'lucide-react';
import { API_ENDPOINTS } from '../config';
import { apiRequest } from '../utils/api';
import { useAppSettings } from '../hooks/useAppSettings';

const SelectionScreen = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role') || 'teacher';
  const [loadingActivities, setLoadingActivities] = useState(false);
  const { flags } = useAppSettings();
  
  // Check if we're inside any portal
  const isInParentPortal = window.location.pathname.startsWith('/parent/');
  const isInTeacherPortal = window.location.pathname.startsWith('/teacher/');
  const isInPortal = isInParentPortal || isInTeacherPortal;

  // Resolve display name from localStorage
  let displayName = 'there';
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.name) displayName = user.name.split(' ')[0];
  } catch (e) {}

  const portalPath =
    role === 'parent' ? '/parent/home' :
    role === 'admin'  ? '/admin/dashboard' :
    '/teacher/home';

  // For parent: fetch child before navigating so childName is always set
  const handleActivitiesClick = async () => {
    if (role === 'admin') {
      navigate('/activities', { state: { mode: 'admin' } });
      return;
    }
    if (role === 'teacher') {
      navigate('/activities', { state: { mode: 'teacher' } });
      return;
    }

    // parent — fetch child first
    setLoadingActivities(true);
    try {
      const parentId = localStorage.getItem('userId');
      let childName = '';
      if (parentId) {
        const children = await apiRequest('get', API_ENDPOINTS.PARENT_MY_CHILDREN(parentId));
        if (children && children.length > 0) {
          localStorage.setItem('selectedChild', JSON.stringify(children[0]));
          childName = children[0].name || '';
        }
      }
      if (!childName) {
        try {
          const user = JSON.parse(localStorage.getItem('user') || '{}');
          childName = user?.child_name || '';
        } catch (e) {}
      }
      navigate('/activities', { state: { mode: 'parent', childName } });
    } catch (e) {
      navigate('/activities', { state: { mode: 'parent' } });
    } finally {
      setLoadingActivities(false);
    }
  };

  const handleChatClick = () => {
    navigate('/chat', { state: { mode: role } });
  };

  const greeting =
    role === 'admin'   ? `Hi Admin! 🛡️` :
    role === 'parent'  ? `Hi, ${displayName}! 👋` :
    `Welcome back, ${displayName}! ✨`;

  const subtitle =
    role === 'admin'   ? 'Test mode — no data will be saved' :
    role === 'parent'  ? 'What would you like to do with your child today?' :
    'What would you like to do today?';

  const options = [
    {
      title: 'Chat with Alexi',
      desc:  role === 'admin'
        ? 'Test the AI chat in sandbox mode'
        : role === 'parent'
        ? 'Let your child have a fun interactive session with Alexi AI'
        : 'Start an interactive AI session with students',
      icon:  <MessageCircle size={48} className="text-white" />,
      onClick: flags.chatEnabled ? handleChatClick : null,
      color: flags.chatEnabled ? 'from-purple-400 to-indigo-500' : 'from-gray-300 to-gray-400',
      emoji: '🤖',
      tag:   role === 'admin' ? '🧪 Test Mode' : 'AI Powered',
      disabled: !flags.chatEnabled,
    },
    {
      title: 'Learning Activities',
      desc:  role === 'admin'
        ? 'Test activities in sandbox mode'
        : role === 'parent'
        ? 'Practice alphabets, numbers, colors and more at home!'
        : 'Explore games and learning tasks with your class',
      icon:  <PlayCircle size={48} className="text-white" />,
      onClick: flags.activitiesEnabled ? handleActivitiesClick : null,
      color: flags.activitiesEnabled ? 'from-pink-400 to-rose-500' : 'from-gray-300 to-gray-400',
      emoji: '🎮',
      tag:   role === 'admin' ? '🧪 Test Mode' : '12 Activities',
      disabled: !flags.activitiesEnabled,
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center p-4 md:p-6"
      style={{ backgroundImage: "url('/backgrounds/selection_bg.png')", backgroundSize: 'cover', backgroundPosition: 'center' }}
    >

      {/* Admin test mode banner */}
      {role === 'admin' && (
        <div className="w-full max-w-3xl mb-6 px-4 py-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center gap-3">
          <span className="text-2xl">🧪</span>
          <div>
            <p className="font-bold text-amber-800 text-sm">Admin Test Mode</p>
            <p className="text-amber-700 text-xs">No student data, no DB saves, no face detection. Safe to test everything.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 md:mb-12"
      >
        <h1 className="text-3xl md:text-5xl font-bold text-gray-800 mb-3">{greeting}</h1>
        <p className="text-base md:text-xl text-gray-500">{subtitle}</p>
      </motion.div>

      {/* Option cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-8 max-w-3xl w-full">
        {options.map((opt, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            whileHover={opt.disabled ? {} : { scale: 1.04, translateY: -8 }}
            whileTap={opt.disabled ? {} : { scale: 0.97 }}
            onClick={opt.disabled ? undefined : opt.onClick}
            className={`bg-gradient-to-br ${opt.color} p-6 md:p-8 rounded-[32px] shadow-2xl text-white relative overflow-hidden group ${
              opt.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'
            }`}
          >
            <div className="absolute -right-4 -top-4 text-8xl opacity-20 group-hover:opacity-30 group-hover:rotate-12 transition-all duration-300">
              {opt.emoji}
            </div>
            <div className="absolute top-4 right-4 px-3 py-1 bg-white/20 backdrop-blur rounded-full text-xs font-bold">
              {opt.disabled ? (
                <span className="flex items-center gap-1"><Lock size={10} /> Disabled by Admin</span>
              ) : opt.tag}
            </div>
            <div className="bg-white/20 w-16 h-16 md:w-20 md:h-20 rounded-3xl flex items-center justify-center mb-4 md:mb-6 group-hover:bg-white/30 transition-colors">
              {opt.disabled ? <Lock size={48} className="text-white" /> : opt.icon}
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">{opt.title}</h2>
            <p className="text-white/80 text-base md:text-lg leading-snug">{opt.desc}</p>
            <div className="mt-4 md:mt-6 flex items-center gap-2 text-white/70 font-semibold">
              <span>
                {opt.disabled
                  ? 'Currently unavailable'
                  : loadingActivities && opt.title === 'Learning Activities' ? 'Loading...' : "Let's Go"}
              </span>
              <span className="text-xl group-hover:translate-x-2 transition-transform">
                {opt.disabled ? '' : loadingActivities && opt.title === 'Learning Activities' ? '⏳' : '→'}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Back to portal - only show if not in any portal */}
      {!isInPortal && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={() => navigate(portalPath)}
          className="mt-8 md:mt-10 text-gray-400 hover:text-gray-600 text-sm font-semibold transition-colors"
        >
          ← Go to {role === 'admin' ? 'Admin Panel' : role === 'parent' ? 'Parent Portal' : 'Teacher Portal'}
        </motion.button>
      )}
    </div>
  );
};

export default SelectionScreen;
