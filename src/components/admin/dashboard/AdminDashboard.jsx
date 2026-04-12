import React from 'react';
import { Card, Button } from '../../../components/shared';
import { Users, UserPlus, TrendingUp, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';

const AdminDashboard = () => {

  const [stats, setStats] = useState({});
  const [pendingApprovals, setPendingApprovals] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemStats, setSystemStats] = useState([]);
  const [approvingId, setApprovingId] = useState(null);
  const [rejectingId, setRejectingId] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsRes, pendingRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/admin/dashboard-stats`),
        axios.get(`${API_BASE_URL}/api/admin/pending-users`),
      ]);
      setStats(statsRes.data);
      setPendingApprovals(Array.isArray(pendingRes.data) ? pendingRes.data : []);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    }
  };

  const handleApprove = async (item) => {
    setApprovingId(item.id);
    try {
      await axios.put(`${API_BASE_URL}/api/admin/approve/${item.id}`);
      setPendingApprovals(prev => prev.filter(p => p.id !== item.id));
      setStats(prev => ({ ...prev, pendingApprovals: Math.max(0, (prev.pendingApprovals || 1) - 1) }));
    } catch (err) {
      console.error('Approve error:', err);
      setErrorMsg('Failed to approve. Please try again.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (item) => {
    if (!window.confirm(`Reject ${item.name}?`)) return;
    setRejectingId(item.id);
    try {
      await axios.delete(`${API_BASE_URL}/api/admin/reject/${item.id}`);
      setPendingApprovals(prev => prev.filter(p => p.id !== item.id));
      setStats(prev => ({ ...prev, pendingApprovals: Math.max(0, (prev.pendingApprovals || 1) - 1) }));
    } catch (err) {
      console.error('Reject error:', err);
      setErrorMsg('Failed to reject. Please try again.');
    } finally {
      setRejectingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm font-semibold flex items-center justify-between">
          <span>❌ {errorMsg}</span>
          <button onClick={() => setErrorMsg('')} className="text-red-400 hover:text-red-600 ml-3">✕</button>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">Admin Dashboard</h1>
          <p className="text-text/60">System overview and management</p>
        </div>
        <button onClick={fetchDashboardData}
          className="text-sm text-primary-600 hover:underline font-semibold">
          🔄 Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <Users size={24} className="text-blue-600 mb-2" />
          <p className="text-2xl sm:text-3xl font-bold text-blue-900">{stats?.totalTeachers || 0}</p>
          <p className="text-sm text-blue-700">Teachers</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <UserPlus size={24} className="text-green-600 mb-2" />
          <p className="text-2xl sm:text-3xl font-bold text-green-900">{stats?.totalParents || 0}</p>
          <p className="text-sm text-green-700">Parents</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <Users size={24} className="text-purple-600 mb-2" />
          <p className="text-2xl sm:text-3xl font-bold text-purple-900">{stats?.totalStudents || 0}</p>
          <p className="text-sm text-purple-700">Students</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <Clock size={24} className="text-yellow-600 mb-2" />
          <p className="text-2xl sm:text-3xl font-bold text-yellow-900">{stats?.pendingApprovals || 0}</p>
          <p className="text-sm text-yellow-700">Pending</p>
        </Card>

        <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100 border-cyan-200">
          <TrendingUp size={24} className="text-cyan-600 mb-2" />
          <p className="text-2xl sm:text-3xl font-bold text-cyan-900">{stats?.activeToday || 0}</p>
          <p className="text-sm text-cyan-700">Active Today</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CheckCircle size={24} className="text-green-600 mb-2" />
          <p className="text-base sm:text-lg font-bold text-green-900">{stats.systemHealth}</p>
          <p className="text-sm text-green-700">System Health</p>
        </Card>
      </div>

      {/* Pending Approvals */}
      {pendingApprovals.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle size={28} className="text-yellow-600" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-text">Pending Approvals</h2>
              <p className="text-sm text-text/60">Review and approve new registrations</p>
            </div>
          </div>

          <div className="space-y-3">
            {pendingApprovals.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl"
              >
                <div className="flex items-center gap-4">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-white
                    ${item.type === 'teacher' ? 'bg-blue-500' : 'bg-green-500'}
                  `}>
                    {item.type === 'teacher' ? '👨‍🏫' : '👨‍👩‍👧'}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text">{item.name}</h3>
                    <p className="text-sm text-text/60">{item.email}</p>
                    <p className="text-xs text-text/50">{item.date}</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    size="sm" variant="primary"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleApprove(item)}
                    disabled={approvingId === item.id || rejectingId === item.id}
                  >
                    {approvingId === item.id ? 'Approving…' : 'Approve'}
                  </Button>
                  <Button
                    size="sm" variant="outline"
                    className="flex-1 sm:flex-none"
                    onClick={() => handleReject(item)}
                    disabled={approvingId === item.id || rejectingId === item.id}
                  >
                    {rejectingId === item.id ? 'Rejecting…' : 'Reject'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-4">
            <Button variant="outline" className="w-full" onClick={fetchDashboardData}>
              Refresh Pending ({pendingApprovals.length})
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">Recent Activity</h2>
          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-text/40">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-sm">No recent activity to show</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity, index) => (
                <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center mt-1 shrink-0
                    ${activity.type === 'success' ? 'bg-green-100' : 'bg-blue-100'}`}>
                    {activity.type === 'success'
                      ? <CheckCircle size={16} className="text-green-600" />
                      : <AlertCircle size={16} className="text-blue-600" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text">{activity.action}</p>
                    <p className="text-sm text-text/60 truncate">{activity.user}</p>
                    <p className="text-xs text-text/50 mt-1">{activity.time}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>

        {/* System Status */}
        <Card>
          <h2 className="text-xl sm:text-2xl font-bold text-text mb-4">System Status</h2>
          {systemStats.length === 0 ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle size={20} className="text-green-600" />
                <p className="text-sm font-semibold text-green-900">All systems operational</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {systemStats.map((stat, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-semibold text-text">{stat.label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-text">{stat.value}</span>
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;