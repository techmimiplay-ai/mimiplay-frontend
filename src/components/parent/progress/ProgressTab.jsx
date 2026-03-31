import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { Card } from '../../../components/shared';
import { CheckCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const LEVELS = [
  { name: 'Little Star',  min: 0,   max: 49,        emoji: '⭐' },
  { name: 'Bright Star',  min: 50,  max: 99,        emoji: '🌟' },
  { name: 'Super Star',   min: 100, max: 199,       emoji: '💫' },
  { name: 'Rising Star',  min: 200, max: 349,       emoji: '🚀' },
  { name: 'Champion',     min: 350, max: 499,       emoji: '🏆' },
  { name: 'Legend',       min: 500, max: Infinity,  emoji: '👑' },
];

function getLevel(stars)     { return LEVELS.find(l => stars >= l.min && stars <= l.max) || LEVELS[0]; }
function getNextLevel(stars) {
  const i = LEVELS.findIndex(l => stars >= l.min && stars <= l.max);
  return LEVELS[i + 1] || null;
}

const SKILLS = [
  { name: 'Alphabets',     unlocksAt: 0,   color: 'green'  },
  { name: 'Common Fruits', unlocksAt: 0,   color: 'green'  },
  { name: 'Colors',        unlocksAt: 10,  color: 'blue'   },
  { name: 'Animals',       unlocksAt: 30,  color: 'purple' },
  { name: 'Numbers',       unlocksAt: 50,  color: 'orange' },
  { name: 'Phonics',       unlocksAt: 100, color: 'pink'   },
];

const barColor = {
  green: 'bg-green-500', blue: 'bg-blue-500',
  purple: 'bg-purple-500', orange: 'bg-orange-500', pink: 'bg-pink-500'
};

const ProgressTab = ({ selectedChild }) => {

  const [starsData, setStarsData] = useState({
    total_stars: 0,
    results: [],
  });
  const [loading, setLoading] = useState(false);
  const [levels, setLevels] = useState([]);
  const [skills, setSkills] = useState([]);

  // ── Fetch config ─────────────────────────────────────────────
  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    try {
      const [levelsRes, skillsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/config/levels`),
        axios.get(`${API_BASE_URL}/api/config/skills`)
      ]);

      if (levelsRes.data?.status === 'success') {
        setLevels(levelsRes.data.levels);
      }
      if (skillsRes.data?.status === 'success') {
        setSkills(skillsRes.data.skills);
      }
    } catch (err) {
      console.error('Config fetch error:', err);
      // Fallback to static data if API fails
      setLevels([
        { name: 'Little Star', min: 0, max: 49, emoji: '⭐' },
        { name: 'Bright Star', min: 50, max: 99, emoji: '🌟' },
        { name: 'Super Star', min: 100, max: 199, emoji: '💫' },
        { name: 'Rising Star', min: 200, max: 349, emoji: '🚀' },
        { name: 'Champion', min: 350, max: 499, emoji: '🏆' },
        { name: 'Legend', min: 500, max: Infinity, emoji: '👑' },
      ]);
      setSkills([
        { name: 'Alphabets', unlocksAt: 0, color: 'green' },
        { name: 'Common Fruits', unlocksAt: 0, color: 'green' },
        { name: 'Colors', unlocksAt: 10, color: 'blue' },
        { name: 'Animals', unlocksAt: 30, color: 'purple' },
        { name: 'Numbers', unlocksAt: 50, color: 'orange' },
        { name: 'Phonics', unlocksAt: 100, color: 'pink' },
      ]);
    }
  };

  useEffect(() => {
    if (!selectedChild?.id) return;
    fetchProgressData(selectedChild.id);
  }, [selectedChild?.id]);

  const fetchProgressData = async (studentId) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/parent/child-stars?student_id=${studentId}`
      );
      if (res.data?.status === 'success') {
        setStarsData({
          total_stars: res.data.total_stars,
          results:     res.data.results,
        });
      }
    } catch (err) {
      console.error('Progress fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const totalStars = starsData.total_stars;
  const results    = starsData.results;

  const getLevel = (stars) => levels.find(l => stars >= l.min && stars <= l.max) || levels[0] || {};
  const getNextLevel = (stars) => {
    const i = levels.findIndex(l => stars >= l.min && stars <= l.max);
    return levels[i + 1];
  };

  const level      = getLevel(totalStars);
  const nextLevel  = getNextLevel(totalStars);
  const progress   = nextLevel
    ? Math.round(((totalStars - level.min) / (nextLevel.min - level.min)) * 100)
    : 100;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const dateStr = d.toISOString().split('T')[0];
    const count = results.filter(r => r.date === dateStr).length;
    return { day: i === 6 ? 'Today' : days[d.getDay()], activities: count };
  });
  const maxAct = Math.max(...weeklyData.map(d => d.activities), 1);

  const skillsWithProgress = skills.map(s => ({
    ...s,
    unlocked: totalStars >= s.unlocksAt,
    progress: totalStars >= s.unlocksAt
      ? 100
      : Math.min(99, Math.round((totalStars / (s.unlocksAt || 1)) * 100)),
  }));

  if (!selectedChild) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3">📈</div>
        <p className="text-text/60 font-semibold">No child selected</p>
        <p className="text-sm text-text/40 mt-1">Please select a child from the top menu</p>
      </div>
    </div>
  );

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="text-center">
        <div className="text-5xl mb-3 animate-spin inline-block">⏳</div>
        <p className="text-text/60">Loading progress...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">
          {selectedChild.name}'s Progress 📈
        </h1>
        <p className="text-text/60">Track skills and milestones</p>
      </div>

      {/* Level Journey */}
      <Card className="bg-gradient-to-r from-purple-400 to-pink-400 text-white border-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-3">
          <div>
            <p className="text-white/80 text-sm mb-1">Current Level</p>
            <h2 className="text-2xl sm:text-3xl font-bold">{level.emoji} {level.name}</h2>
          </div>
          <div className="sm:text-right">
            <p className="text-white/80 text-sm mb-1">Next Level</p>
            <h3 className="text-lg sm:text-xl font-semibold">
              {nextLevel ? `${nextLevel.emoji} ${nextLevel.name}` : '👑 Max Level!'}
            </h3>
          </div>
        </div>
        <div className="flex justify-between text-sm text-white/80 mb-1">
          <span>{totalStars} ⭐</span>
          <span>{nextLevel ? `${nextLevel.min - totalStars} more to unlock` : 'Legend!'}</span>
        </div>
        <div className="w-full bg-white/30 rounded-full h-4">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-white rounded-full"
          />
        </div>
        <p className="text-right text-white/80 text-sm mt-1">{progress}%</p>
      </Card>

      {/* Total Stars */}
      <Card className="text-center py-6">
        <motion.div key={totalStars} initial={{ scale: 0.8 }} animate={{ scale: 1 }}
          transition={{ type: 'spring' }}>
          <div className="text-6xl mb-2">⭐</div>
          <p className="text-5xl sm:text-6xl font-bold text-yellow-500">{totalStars}</p>
          <p className="text-text/60 text-lg mt-1">Total Stars Earned</p>
          <p className="text-text/40 text-sm">{results.length} activities completed</p>
        </motion.div>
      </Card>

      {/* Skills Progress */}
      <Card>
        <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">Skills Progress</h2>
        <div className="space-y-4">
          {skillsWithProgress.map((skill, i) => (
            <motion.div key={skill.name}
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.07 }}
              className={`p-4 rounded-2xl border-2 ${
                skill.unlocked ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'
              }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  {skill.unlocked
                    ? <CheckCircle size={20} className="text-green-500 shrink-0" />
                    : <Lock size={20} className="text-gray-400 shrink-0" />}
                  <div>
                    <h3 className="font-semibold text-text">{skill.name}</h3>
                    <p className="text-xs text-text/50">
                      {skill.unlocked
                        ? 'Unlocked ✅'
                        : `Needs ${skill.unlocksAt} ⭐ (${Math.max(0, skill.unlocksAt - totalStars)} more)`}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-bold shrink-0">
                  {skill.unlocked ? '100%' : `${skill.progress}%`}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${skill.progress}%` }}
                  transition={{ duration: 0.6, delay: i * 0.07 }}
                  className={`h-full rounded-full ${
                    skill.unlocked ? barColor[skill.color] : 'bg-gray-400'
                  }`}
                />
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Weekly Chart */}
      <Card>
        <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">This Week's Activity</h2>
        <div className="flex items-end justify-between gap-2 sm:gap-4 h-40 sm:h-48">
          {weeklyData.map((day, i) => (
            <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(day.activities / maxAct) * 100}%` }}
                transition={{ duration: 0.5, delay: i * 0.07 }}
                className="w-full bg-gradient-to-t from-primary-400 to-secondary-400 rounded-t-xl min-h-[8px] relative"
              >
                {day.activities > 0 && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs sm:text-sm font-bold text-text">
                    {day.activities}
                  </span>
                )}
              </motion.div>
              <span className="text-xs font-semibold text-text">{day.day}</span>
            </div>
          ))}
        </div>
      </Card>

    </div>
  );
};

export default ProgressTab;
