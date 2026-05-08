/**
 * ActivitiesScreen.jsx
 * Unified activities page for teacher, parent and admin.
 * Reads mode from location state (set by SelectionScreen).
 * Replaces ParentActivities.jsx as the canonical activities route.
 */

import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import ActivitiesTab from '../components/teacher/activities/ActivitiesTab';

const ActivitiesScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mode      = location.state?.mode || localStorage.getItem('role') || 'teacher';
  const childName = location.state?.childName || (() => {
    try {
      const s = JSON.parse(localStorage.getItem('selectedChild') || '{}');
      return s?.name || s?.fullName || '';
    } catch { return ''; }
  })();

  const backPath =
    mode === 'admin'  ? '/select' :
    mode === 'parent' ? '/select' :
    '/select';

  const modeLabel =
    mode === 'admin'  ? '🧪 Admin Test' :
    mode === 'parent' ? '🏠 Home Mode'  :
    '🏫 Classroom';

  const modeBg =
    mode === 'admin'  ? 'bg-amber-100 text-amber-700' :
    mode === 'parent' ? 'bg-pink-100 text-pink-700'   :
    'bg-purple-100 text-purple-700';

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">

      {/* Admin test mode banner */}
      {mode === 'admin' && (
        <div className="w-full px-4 py-2 bg-amber-50 border-b-2 border-amber-300 flex items-center gap-2">
          <span className="text-lg">🧪</span>
          <p className="text-amber-800 text-sm font-bold">
            Admin Test Mode — no data will be saved to the database
          </p>
        </div>
      )}

      {/* Top bar */}
      <div className="bg-white/80 backdrop-blur-lg border-b-4 border-pink-200 px-4 md:px-8 py-4">
        <div className="flex items-center gap-3 md:gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 font-bold rounded-2xl transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="hidden md:inline">Back</span>
          </motion.button>
          <h1 className="text-xl md:text-3xl font-bold text-gray-800">🎮 Learning Activities</h1>
          <span className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-bold ml-1 ${modeBg}`}>
            {modeLabel}
          </span>
        </div>
      </div>

      {/* Activities component */}
      <div className="px-4 md:px-8 py-6">
        <ActivitiesTab mode={mode} childName={childName} />
      </div>
    </div>
  );
};

export default ActivitiesScreen;
