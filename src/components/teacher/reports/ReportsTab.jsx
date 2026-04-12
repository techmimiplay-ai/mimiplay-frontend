import React, { useState, useEffect } from 'react';
import { Button, Card, PageLoader } from '../../../components/shared';
import { Download, TrendingUp, TrendingDown, BarChart3, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../../config';
import axios from 'axios';

const ReportsTab = () => {
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });

  const [filterActivity, setFilterActivity] = useState('all');
  const [loading, setLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState('');
  const [classStats, setClassStats] = useState({
    avgScore: 0,
    totalActivities: 0,
    totalStars: 0,
    avgAttendance: 0,
    improvement: '+0%'
  });
  const [topPerformers, setTopPerformers] = useState([]);
  const [needsAttention, setNeedsAttention] = useState([]);
  const [activityBreakdown, setActivityBreakdown] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      // ✅ Yahan fetch ki jagah axios use ho raha hai taaki main.jsx ka interceptor token bhej sake
      const response = await axios.get(`${API_BASE_URL}/api/teacher/reports`, {
        params: {
          start_date: dateRange.start,
          end_date: dateRange.end
        },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      // Axios mein data direct response.data mein milta hai
      const data = response.data;

      if (data.status === 'success') {
        setClassStats(data.classStats);
        setTopPerformers(data.topPerformers);
        setNeedsAttention(data.needsAttention);
        setActivityBreakdown(data.activityBreakdown);
        setWeeklyProgress(data.weeklyProgress);
      }
    } catch (err) {
      console.error('Error fetching reports:', err);
      if (err.response && err.response.status === 401) {
        console.error('Unauthorized: Token invalid ya expire ho gaya hai.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [dateRange]);

  const showToast = (msg) => { setToastMsg(msg); setTimeout(() => setToastMsg(''), 3000); };

  const downloadReport = () => {
    if (!topPerformers.length && !activityBreakdown.length) {
      setToastMsg('No report data to download yet.');
      return;
    }
    const rows = [
      ['Student', 'Score', 'Stars', 'Trend'],
      ...topPerformers.map(s => [s.name, s.score, s.stars, s.trend]),
      [],
      ['Activity', 'Completed', 'Avg Score', 'Success %'],
      ...activityBreakdown.map(a => [a.activity, a.completed, a.avgScore, a.percentage]),
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `class-report-${dateRange.start}-to-${dateRange.end}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };
  const emailParents  = () => showToast('Email to parents coming soon!');

  if (loading) return <PageLoader variant="inline" emoji="📊" text="Loading reports…" />;

  return (
    <div className="space-y-6">
      {toastMsg && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm font-semibold">
          ℹ️ {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-2">Reports & Analytics</h1>
          <p className="text-text/60">Track class performance and progress</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" icon={Mail} onClick={emailParents} className="w-full sm:w-auto">
            Email Parents
          </Button>
          <Button variant="primary" icon={Download} onClick={downloadReport} className="w-full sm:w-auto">
            Download Report
          </Button>
          <button onClick={fetchReports} className="text-sm text-primary-600 hover:underline font-semibold whitespace-nowrap">
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">Start Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-text mb-2">End Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label className="block text-sm font-semibold text-text mb-2">Activity Filter</label>
            <select
              value={filterActivity}
              onChange={(e) => setFilterActivity(e.target.value)}
              className="w-full px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
            >
              <option value="all">All Activities</option>
              <option value="alphabets">Alphabets</option>
              <option value="phonics">Phonics</option>
              <option value="objects">Objects</option>
              <option value="colors">Colors</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Class Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 size={20} className="text-purple-700" />
            <p className="text-sm text-purple-700 font-semibold">Class Average</p>
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-purple-900 mb-1">
            ⭐ {classStats.avgScore}/5
          </p>
          <div className="flex items-center gap-1 text-green-600">
            <TrendingUp size={14} />
            <span className="text-xs font-semibold">{classStats.improvement}</span>
          </div>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-700 font-semibold mb-2">Total Activities</p>
          <p className="text-3xl lg:text-4xl font-bold text-blue-900">{classStats.totalActivities}</p>
          <p className="text-xs text-blue-700 mt-1">This period</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <p className="text-sm text-yellow-700 font-semibold mb-2">Stars Earned</p>
          <p className="text-3xl lg:text-4xl font-bold text-yellow-900">{classStats.totalStars}</p>
          <p className="text-xs text-yellow-700 mt-1">Collective effort</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-green-700 font-semibold mb-2">Avg Attendance</p>
          <p className="text-3xl lg:text-4xl font-bold text-green-900">{classStats.avgAttendance}%</p>
          <p className="text-xs text-green-700 mt-1">Excellent!</p>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200">
          <p className="text-sm text-pink-700 font-semibold mb-2">Engagement</p>
          <p className="text-3xl lg:text-4xl font-bold text-pink-900">
            {classStats.avgScore >= 4 ? 'High' : classStats.avgScore >= 3 ? 'Medium' : 'Low'}
          </p>
          <p className="text-xs text-pink-700 mt-1">Keep it up!</p>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Progress */}
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">Weekly Progress</h2>
          <div className="space-y-3">
            {weeklyProgress.length > 0 ? weeklyProgress.map((day, index) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-text">{day.day}</span>
                  <span className="text-xs sm:text-sm text-text/60">{day.activities} activities · {day.avgScore}/5 ⭐</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(day.avgScore / 5) * 100}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className={`h-full rounded-full ${
                      day.avgScore >= 4.5 ? 'bg-green-500' :
                      day.avgScore >= 4.0 ? 'bg-blue-500' :
                      day.avgScore >= 3.5 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  />
                </div>
              </motion.div>
            )) : (
              <p className="text-text/60 text-center py-4">No data available</p>
            )}
          </div>
        </Card>

        {/* Activity Breakdown */}
        <Card>
          <h2 className="text-xl font-bold text-text mb-4">Activity Breakdown</h2>
          <div className="space-y-4">
            {activityBreakdown.length > 0 ? activityBreakdown.map((item, index) => (
              <motion.div
                key={item.activity}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text">{item.activity}</h3>
                  <span className="text-xl md:text-2xl">⭐ {item.avgScore}/5</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs sm:text-sm text-text/60 mb-2">
                  <span>{item.completed} completed</span>
                  <span>{item.percentage}% success rate</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
                    className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
                  />
                </div>
              </motion.div>
            )) : (
              <p className="text-text/60 text-center py-4">No data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Top Performers & Needs Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl md:text-3xl">🏆</div>
            <h2 className="text-xl font-bold text-text">Top Performers</h2>
          </div>
          <div className="space-y-3">
            {topPerformers.length > 0 ? topPerformers.map((student) => (
              <div key={student.rank} className="flex items-center justify-between p-3 md:p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`
                    w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold text-white text-lg md:text-xl
                    ${student.rank === 1 ? 'bg-yellow-500' :
                      student.rank === 2 ? 'bg-gray-400' :
                      'bg-orange-600'}
                  `}>
                    {student.rank}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm md:text-base text-text">{student.name}</h3>
                    <p className="text-xs md:text-sm text-text/60">Score: {student.score}/5 · {student.stars} stars</p>
                  </div>
                </div>
                <div className="text-xl md:text-2xl">
                  {student.trend === 'up' ? '📈' : '➡️'}
                </div>
              </div>
            )) : (
              <p className="text-text/60 text-center py-4">No data available</p>
            )}
          </div>
        </Card>

        {/* Needs Attention */}
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <div className="text-2xl md:text-3xl">⚠️</div>
            <h2 className="text-xl font-bold text-text">Needs Attention</h2>
          </div>
          <div className="space-y-3">
            {needsAttention.length > 0 ? needsAttention.map((student, index) => (
              <div key={index} className="p-3 md:p-4 bg-red-50 rounded-2xl border-2 border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-text">{student.name}</h3>
                  <span className="text-xl md:text-2xl">⭐ {student.score}/5</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <p className="text-xs md:text-sm text-red-700">Struggling with: <strong>{student.subject}</strong></p>
                  <Button size="sm" variant="outline" className="w-full sm:w-auto">
                    View Details
                  </Button>
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-text/60">
                <p className="text-2xl mb-2">🎉</p>
                <p>All students are doing great!</p>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ReportsTab;