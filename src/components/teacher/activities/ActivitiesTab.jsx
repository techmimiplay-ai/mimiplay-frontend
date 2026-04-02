/**
 * ActivitiesTab.jsx  (entry point)
 * ─────────────────────────────────────────────────────────────
 * Lean grid of activity cards + config modal.
 * All heavy runtime logic lives in MimiActivityOverlay.jsx.
 *
 * Key production decisions:
 *   • ACTIVITIES is imported from a module-level constant so the
 *     array reference never changes between renders → React.memo()
 *     on MimiActivityOverlay can actually bail out.
 *   • handleStudentDone and handleClose are both useCallback so they
 *     never cause spurious re-renders of the overlay.
 *   • activityDifficulty is the ONLY local state that should cause
 *     this component to re-render; all other changes happen inside
 *     the overlay.
 */

import React, { useState, useCallback, memo } from 'react';
import axios from 'axios';
import { Button, Card, Modal } from '../../../components/shared';
import { Play, Settings, Plus, Clock, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config';
import { useStars } from '../../../context/StarContext';

import LOG from './logger';
import ACTIVITIES from './data/activities';
import MimiActivityOverlay from './MimiActivityOverlay';

/* ── Constants (module-level) ─────────────────────────────────── */
const DIFFICULTY_CFG = {
  easy:   { label: 'Easy',   cls: 'bg-emerald-100 text-emerald-700' },
  medium: { label: 'Medium', cls: 'bg-amber-100 text-amber-700' },
  hard:   { label: 'Hard',   cls: 'bg-rose-100 text-rose-700' },
};

const STATS_CARDS = (activities) => [
  {
    label: 'Total Activities',
    value: activities.length,
    colors: 'from-blue-50 to-blue-100 border-blue-200',
    tc: 'text-blue-700',
  },
  {
    label: 'Completions',
    value: activities.reduce((s, a) => s + a.studentsCompleted, 0),
    colors: 'from-emerald-50 to-emerald-100 border-emerald-200',
    tc: 'text-emerald-700',
  },
  {
    label: 'Avg Score',
    value: (() => {
      const rated = activities.filter(a => a.avgScore > 0);
      return rated.length
        ? `${(rated.reduce((s, a) => s + a.avgScore, 0) / rated.length).toFixed(1)}/5`
        : '—';
    })(),
    colors: 'from-purple-50 to-purple-100 border-purple-200',
    tc: 'text-purple-700',
  },
  {
    label: 'Avg Duration',
    value: '11m',
    colors: 'from-yellow-50 to-yellow-100 border-yellow-200',
    tc: 'text-yellow-700',
  },
];

/* ── ActivitiesTab ────────────────────────────────────────────── */
const ActivitiesTab = ({ isParentMode = false }) => {
  const { addActivityResult } = useStars();

  const [showConfigModal,    setShowConfigModal]    = useState(false);
  const [selectedActivity,   setSelectedActivity]   = useState(null);
  const [runningActivity,    setRunningActivity]     = useState(null);
  const [runningDifficulty,  setRunningDifficulty]  = useState('easy');
  const [lastResult,         setLastResult]          = useState(null);
  const [showBanner,         setShowBanner]          = useState(false);
  const [activityDifficulty, setActivityDifficulty] = useState({});

  /* ── Start activity ─────────────────────────────────────────── */
  const handleStartActivity = useCallback((activity) => {
    const diff = activityDifficulty[activity.id] || 'easy';
    LOG.info('ActivitiesTab', 'Starting activity', { id: activity.id, name: activity.name, diff });
    setRunningDifficulty(diff);
    setRunningActivity(activity); // stable ref from ACTIVITIES array
  }, [activityDifficulty]);

  /* ── Student done callback ──────────────────────────────────── */
  const handleStudentDone = useCallback(async ({ stars, score, studentName }) => {
    const act = runningActivity;
    LOG.info('ActivitiesTab', 'Student done', { studentName, stars, score });

    // Resolve student ID
    let studentId = null;
    try {
      const res = await axios.post(API_ENDPOINTS.GET_STUDENT_ID, { name: studentName });
      if (res.data?.status === 'found') studentId = res.data.student_id;
      LOG.info('ActivitiesTab', 'Resolved student ID', { studentId });
    } catch (e) {
      LOG.warn('ActivitiesTab', 'ID lookup failed — using slug', e.message);
    }
    studentId = studentId
      ?? `student-${studentName.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;

    // Save to context
    addActivityResult({
      studentId, studentName,
      activityId:   act?.id   ?? 0,
      activityName: act?.name ?? 'Activity',
      stars, score,
    });

    // Persist to backend
    axios.post(`${API_BASE_URL}/save-activity-result`, {
      student_id: studentId, student_name: studentName,
      activity_id: act?.id ?? 0, activity_name: act?.name ?? 'Activity',
      stars, score,
    }).catch(e => LOG.warn('ActivitiesTab', 'Save failed', e.message));

    setLastResult({ stars, score, studentName, activityName: act?.name });
    setShowBanner(true);
    setTimeout(() => setShowBanner(false), 5000);
  }, [addActivityResult, runningActivity]);

  /* ── Close overlay ──────────────────────────────────────────── */
  const handleClose = useCallback(() => {
    LOG.info('ActivitiesTab', 'Overlay closed');
    setRunningActivity(null);
  }, []);

  /* ── Derived ────────────────────────────────────────────────── */
  const stats = STATS_CARDS(ACTIVITIES);

  /* ── Render ─────────────────────────────────────────────────── */
  return (
    <>
      {/* Overlay — memo'd, props are all stable */}
      {runningActivity && (
        <MimiActivityOverlay
          activity={runningActivity}
          difficulty={runningDifficulty}
          onStudentDone={handleStudentDone}
          onClose={handleClose}
          isParentMode={isParentMode}
        />
      )}

      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-text mb-1">Learning Activities</h1>
            <p className="text-text/60 text-sm sm:text-base">Manage and launch classroom activities</p>
          </div>
          <Button variant="primary" icon={Plus} className="self-stretch sm:self-auto">
            Create Custom Activity
          </Button>
        </div>

        {/* Success banner */}
        <AnimatePresence>
          {showBanner && lastResult && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-2xl p-4 flex items-center gap-4 text-white">
              <div className="text-4xl">🎉</div>
              <div>
                <p className="font-bold text-lg">{lastResult.activityName} complete!</p>
                <p className="text-white/90">
                  {lastResult.studentName} earned{' '}
                  {[...Array(5)].map((_, i) => <span key={i}>{i < lastResult.stars ? '⭐' : '☆'}</span>)}
                  {' '}— live in Students & Parent portal!
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {stats.map(s => (
            <Card key={s.label} className={`bg-gradient-to-br ${s.colors} !p-4`}>
              <p className={`text-xs font-semibold ${s.tc} mb-1`}>{s.label}</p>
              <p className={`text-3xl font-bold ${s.tc}`}>{s.value}</p>
            </Card>
          ))}
        </div>

        {/* Activity grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {ACTIVITIES.map((activity, index) => {
            const diff    = activityDifficulty[activity.id] || 'easy';
            const diffCfg = DIFFICULTY_CFG[diff];
            return (
              <motion.div key={activity.id} initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-2xl flex items-center justify-center text-4xl shadow">
                        {activity.icon}
                      </div>
                      <div>
                        <h3 className="font-bold text-text text-lg">{activity.name}</h3>
                        <p className="text-sm text-text/60">{activity.category}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      {activity.id > 6  && <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-black rounded-lg">NEW</span>}
                      {activity.isAI    && <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-black rounded-lg">🤖 AI</span>}
                    </div>
                  </div>
                  <p className="text-sm text-text/70 mb-4">{activity.description}</p>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text/60">Difficulty:</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${diffCfg.cls}`}>
                        {diffCfg.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-text/60">Avg Time:</span>
                      <span className="font-semibold text-text flex items-center gap-1">
                        <Clock size={14} />{activity.avgTime}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mb-4 p-3 bg-gray-50 rounded-xl">
                    <Users size={16} className="text-text/60" />
                    <span className="text-sm text-text/70">
                      {activity.studentsCompleted > 0
                        ? <><strong>{activity.studentsCompleted}</strong> completions</>
                        : <span className="text-purple-500 font-semibold">Ready to use!</span>
                      }
                    </span>
                    {activity.avgScore > 0 && (
                      <span className="ml-auto text-sm font-semibold text-text">⭐ {activity.avgScore}/5</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="primary" icon={Play} className="flex-1"
                      onClick={() => handleStartActivity(activity)}>
                      Start
                    </Button>
                    <Button variant="outline" icon={Settings}
                      onClick={() => { setSelectedActivity(activity); setShowConfigModal(true); }}>
                      Config
                    </Button>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Config modal */}
        {selectedActivity && (
          <Modal isOpen={showConfigModal} onClose={() => setShowConfigModal(false)}
            title={`Configure: ${selectedActivity.name}`} size="md">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Difficulty Level</label>
                <select
                  value={activityDifficulty[selectedActivity.id] || 'easy'}
                  onChange={e => setActivityDifficulty(prev => ({ ...prev, [selectedActivity.id]: e.target.value }))}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Time Limit (minutes)</label>
                <input type="number" defaultValue={15}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Number of Questions</label>
                <input type="number" defaultValue={10}
                  className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none" />
              </div>
              {selectedActivity.isAI && (
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                  <p className="text-sm text-blue-800 font-bold mb-1">🤖 AI-Powered Activity</p>
                  <p className="text-xs text-blue-600">
                    Fresh questions every session, automatically matched to difficulty.
                  </p>
                </div>
              )}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                <p className="text-sm text-amber-800">ℹ️ Settings apply the next time this activity is launched.</p>
              </div>
              <div className="flex gap-3">
                <Button variant="primary" className="flex-1" onClick={() => setShowConfigModal(false)}>
                  Save Settings
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setShowConfigModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </>
  );
};

export default ActivitiesTab;
