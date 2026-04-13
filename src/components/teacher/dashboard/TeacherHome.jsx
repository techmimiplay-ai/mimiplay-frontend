import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { useNavigate } from 'react-router-dom';
import { Button, Card, PageLoader } from '../../../components/shared';
import { Users, BookOpen, BarChart, TrendingUp, Monitor, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const TeacherHome = () => {
  const navigate = useNavigate();

  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  const teacherId = localStorage.getItem('userId') || localStorage.getItem('user_id');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/api/teacher/dashboard-stats?teacher_id=${teacherId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      if (res.data?.status === 'success') {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Dashboard stats error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    const run = () => { if (!cancelled) fetchStats(); };
    run();
    const iv = setInterval(run, 30000);
    window.addEventListener('activity-result-saved', run);
    return () => { cancelled = true; clearInterval(iv); window.removeEventListener('activity-result-saved', run); };
  }, []);

  const handleStartSession = () => navigate('/teacher/selection');

  if (loading) return <PageLoader variant="inline" emoji="📊" text="Loading dashboard…" />;

  const firstName = stats?.teacher_name
    ? stats.teacher_name.split(' ')[0]
    : 'Teacher';

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">
            Welcome Back, {firstName}! 👋
          </h1>
          <p className="text-text/60 text-sm sm:text-base">Here's what's happening in your class today</p>
        </div>
        <Button variant="primary" size="xl" icon={Play}
          onClick={handleStartSession} className="shadow-2xl w-full sm:w-auto">
          Start Classroom Session
        </Button>
      </div>

      {/* Classroom Session Card */}
      <Card className="bg-gradient-to-r from-primary-400 to-secondary-400 text-white border-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">Ready to Start Learning?</h2>
            <p className="text-white/90 mb-4 text-sm sm:text-base">
              Launch Mimi on the Smart TV and begin today's activities
            </p>
            <Button variant="outline" icon={Monitor} onClick={handleStartSession}
              className="bg-white text-primary-600 hover:bg-white/90 border-0 w-full sm:w-auto">
              Launch on Smart TV
            </Button>
          </div>
          <div className="text-6xl sm:text-9xl opacity-20 self-end sm:self-auto">📺</div>
        </div>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.0 }}>
          <Card hover className="bg-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-text text-sm sm:text-base">Students Present</h3>
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Users size={18} className="text-green-600 sm:hidden" />
                <Users size={24} className="text-green-600 hidden sm:block" />
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-text mb-2">
              {stats?.present_today ?? 0}/{stats?.total_students ?? 0}
            </p>
            <div className="flex items-center gap-1 sm:gap-2 text-green-600">
              <TrendingUp size={14} />
              <span className="text-xs sm:text-sm font-semibold">
                {stats?.attendance_pct ?? 0}% attendance
              </span>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card hover className="bg-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-text text-sm sm:text-base">Activities Today</h3>
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <BookOpen size={18} className="text-blue-600 sm:hidden" />
                <BookOpen size={24} className="text-blue-600 hidden sm:block" />
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-text mb-2">
              {stats?.activities_today ?? 0}
            </p>
            <p className="text-xs sm:text-sm text-text/60">Completed today</p>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card hover className="bg-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-text text-sm sm:text-base">Average Score</h3>
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-yellow-100 flex items-center justify-center">
                <BarChart size={18} className="text-yellow-600 sm:hidden" />
                <BarChart size={24} className="text-yellow-600 hidden sm:block" />
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-text mb-2">
              {stats?.avg_score ?? 0}/5
            </p>
            <div className="text-lg sm:text-2xl">
              {'⭐'.repeat(Math.round(stats?.avg_score ?? 0))}
              {'☆'.repeat(5 - Math.round(stats?.avg_score ?? 0))}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card hover className="bg-white">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-text text-sm sm:text-base">This Week</h3>
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <TrendingUp size={18} className="text-purple-600 sm:hidden" />
                <TrendingUp size={24} className="text-purple-600 hidden sm:block" />
              </div>
            </div>
            <p className="text-2xl sm:text-4xl font-bold text-text mb-2">
              {stats?.weekly_stars ?? 0}
            </p>
            <p className="text-xs sm:text-sm text-text/60">Stars earned</p>
          </Card>
        </motion.div>

      </div>

      {/* Recent Activities */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-text">Recent Activities</h2>
          <button onClick={fetchStats}
            className="text-sm text-primary-600 hover:underline font-semibold">
            🔄 Refresh
          </button>
        </div>

        {(!stats?.recent_activities || stats.recent_activities.length === 0) ? (
          <div className="text-center py-10 text-text/40">
            <div className="text-5xl mb-3">📭</div>
            <p className="font-semibold">No activities today yet</p>
            <p className="text-sm mt-1">Start a classroom session to begin!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {stats.recent_activities.map((item, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors gap-3 sm:gap-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                    <BookOpen size={20} className="text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-text text-sm sm:text-base">{item.activity_name}</h3>
                    <p className="text-xs sm:text-sm text-text/60">
                      {item.student_name} ·{' '}
                      {item.timestamp
                        ? new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                        : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 sm:gap-6 pl-13 sm:pl-0">
                  <div className="text-right">
                    <p className="text-xs sm:text-sm text-text/60">Score</p>
                    <p className="font-semibold text-text text-sm sm:text-base">{item.score}%</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm">
                      {'⭐'.repeat(item.stars)}{'☆'.repeat(5 - item.stars)}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <Button variant="outline" onClick={() => navigate('/teacher/students')} className="h-16 sm:h-20">
          <Users className="mr-2" /> View Students
        </Button>
        <Button variant="outline" onClick={() => navigate('/teacher/attendance')} className="h-16 sm:h-20">
          Mark Attendance
        </Button>
        <Button variant="outline" onClick={() => navigate('/teacher/reports')} className="h-16 sm:h-20">
          Generate Report
        </Button>
      </div>

    </div>
  );
};

export default TeacherHome;