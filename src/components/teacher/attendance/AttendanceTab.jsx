import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../../config';
import { Button, Card, Modal, ConfirmModal } from '../../../components/shared';
import { Calendar, Download, CheckCircle, XCircle, Clock, MessageSquare, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const AttendanceTab = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(null); // student name jo save ho raha hai
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [saveMsg, setSaveMsg] = useState('');
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const confirmAction = (message, onConfirm) => setConfirm({ open: true, message, onConfirm });
  const closeConfirm = () => setConfirm({ open: false, message: '', onConfirm: null });

  // ── Fetch attendance ────────────────────────────────────────
  const fetchAttendance = useCallback(async (date) => {
    try {
      setLoading(true);
      // ✅ Axios GET call with params
      const res = await axios.get(`${API_BASE_URL}/api/teacher/attendance`, {
        params: { date: date }
      });
      
      // Axios automatically parses JSON, data is in res.data
      if (res.data?.status === 'success') {
        setAttendanceData(res.data.data || []);
      }
    } catch (err) {
      console.error('Attendance fetch error:', err);
      if (err.response?.status === 401) {
        setSaveMsg('❌ Session expired. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAttendance(selectedDate);
  }, [selectedDate, fetchAttendance]);

  // ── Stats ───────────────────────────────────────────────────
  const stats = {
    total: attendanceData.length,
    present: attendanceData.filter(s => s.status === 'present').length,
    absent: attendanceData.filter(s => s.status === 'absent').length,
    late: attendanceData.filter(s => s.status === 'late').length,
    autoDetected: attendanceData.filter(s => s.method === 'auto').length,
  };

  // ── Toggle attendance ───────────────────────────────────────
  const toggleAttendance = async (student) => {
    const nextStatus = {
      present: 'absent',
      absent: 'late',
      late: 'present',
    }[student.status] || 'present';

    // Optimistic UI update
    setAttendanceData(prev => prev.map(s =>
      s.id === student.id ? {
        ...s,
        status: nextStatus,
        time: nextStatus !== 'absent'
          ? new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : null,
        method: 'manual',
      } : s
    ));

    // DB mein save karo
    try {
      setSaving(student.name);
      // ✅ Axios POST call (Interceptors will add token)
      await axios.post(`${API_BASE_URL}/api/teacher/attendance/update`, {
        name: student.name,
        status: nextStatus,
        date: selectedDate,
        student_id: student.studentId || student.id,
      });
      setSaveMsg(`✅ ${student.name} marked ${nextStatus}`);
      setTimeout(() => setSaveMsg(''), 3000);
    } catch (err) {
      console.error('Toggle error:', err);
      setSaveMsg(`❌ Failed to update ${student.name}`);
      setTimeout(() => setSaveMsg(''), 3000);
      // Revert on error
      fetchAttendance(selectedDate);
    } finally {
      setSaving(null);
    }
  };

  // ── Mark all present ────────────────────────────────────────
  const markAllPresent = async () => {
    confirmAction('Mark ALL students as present?', async () => {
      closeConfirm();
      try {
        setSaveMsg('Saving all...');
        await Promise.all(
          attendanceData
            .filter(s => s.status !== 'present')
            .map(s => axios.post(`${API_BASE_URL}/api/teacher/attendance/update`, {
              name: s.name, status: 'present', date: selectedDate, student_id: s.studentId || s.id,
            }))
        );
        await fetchAttendance(selectedDate);
        setSaveMsg('✅ All students marked present!');
        setTimeout(() => setSaveMsg(''), 3000);
      } catch (err) {
        setSaveMsg('❌ Some updates failed');
        setTimeout(() => setSaveMsg(''), 3000);
      }
    });
  };

  // ── Export CSV ──────────────────────────────────────────────
  const exportAttendance = () => {
    const csv = [
      ['Roll No', 'Name', 'Status', 'Time', 'Method'],
      ...attendanceData.map(s => [
        s.rollNo, s.name, s.status, s.time || '-', s.method || '-'
      ])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-${selectedDate}.csv`;
    a.click();
  };

  // ── Review ──────────────────────────────────────────────────
  const handleAddReview = (student) => {
    setSelectedStudent(student);
    setReviewText('');
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!reviewText.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/api/teacher/add-review`, {
        student_id: selectedStudent.studentId || selectedStudent.id,
        student_name: selectedStudent.name,
        review: reviewText,
        date: selectedDate,
      });
      setShowReviewModal(false);
      setReviewText('');
    } catch (err) {
      console.error('Review error:', err);
      setSaveMsg(`❌ Could not save review: ${err.response?.data?.msg || err.message}`);
      setTimeout(() => setSaveMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-text mb-2">Attendance</h1>
          <p className="text-text/60">Track and manage student attendance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button variant="outline" icon={Download} onClick={exportAttendance} className="w-full sm:w-auto">
            Export CSV
          </Button>
          <Button variant="outline" icon={RefreshCw}
            onClick={() => fetchAttendance(selectedDate)} className="w-full sm:w-auto">
            Refresh
          </Button>
          <Button variant="primary" onClick={markAllPresent} className="w-full sm:w-auto">
            Mark All Present
          </Button>
        </div>
      </div>

      {/* Save message */}
      {saveMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className={`px-4 py-3 rounded-xl border-2 font-semibold ${
            saveMsg.startsWith('✅')
              ? 'bg-green-50 border-green-300 text-green-800'
              : saveMsg.startsWith('❌')
              ? 'bg-red-50 border-red-300 text-red-800'
              : 'bg-blue-50 border-blue-300 text-blue-800'
          }`}>
          {saveMsg}
        </motion.div>
      )}

      {/* Date Selector */}
      <Card>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <Calendar size={24} className="text-primary-600 hidden sm:block" />
          <div className="w-full">
            <label className="block text-sm font-semibold text-text mb-2">Select Date</label>
            <input type="date" value={selectedDate}
              onChange={e => setSelectedDate(e.target.value)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400" />
          </div>
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Total Students</p>
          <p className="text-3xl lg:text-4xl font-bold text-blue-900">{stats.total}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle size={16} className="text-green-700" />
            <p className="text-sm text-green-700">Present</p>
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-green-900">{stats.present}</p>
          <p className="text-xs text-green-700 mt-1">
            {stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0}%
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <div className="flex items-center gap-2 mb-1">
            <XCircle size={16} className="text-red-700" />
            <p className="text-sm text-red-700">Absent</p>
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-red-900">{stats.absent}</p>
          <p className="text-xs text-red-700 mt-1">
            {stats.total > 0 ? Math.round((stats.absent / stats.total) * 100) : 0}%
          </p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-2 mb-1">
            <Clock size={16} className="text-yellow-700" />
            <p className="text-sm text-yellow-700">Late</p>
          </div>
          <p className="text-3xl lg:text-4xl font-bold text-yellow-900">{stats.late}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 sm:col-span-2 md:col-span-1">
          <p className="text-sm text-purple-700 mb-1">Auto-Detected</p>
          <p className="text-3xl lg:text-4xl font-bold text-purple-900">{stats.autoDetected}</p>
          <p className="text-xs text-purple-700 mt-1 text-nowrap">Face Recognition</p>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg md:text-xl font-bold text-text">
            Attendance Record — {selectedDate}
          </h2>
          {loading && (
            <span className="text-sm text-text/50 animate-pulse">Loading...</span>
          )}
        </div>

        {/* No students */}
        {!loading && attendanceData.length === 0 && (
          <div className="text-center py-12">
            <div className="text-5xl mb-3">👥</div>
            <p className="text-text/60 font-semibold">No students found</p>
            <p className="text-sm text-text/40 mt-1">
              Add students from the Admin panel first
            </p>
          </div>
        )}

        {attendanceData.length > 0 && (
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-4 font-semibold text-text text-sm md:text-base">Roll No</th>
                    <th className="text-left py-4 px-4 font-semibold text-text text-sm md:text-base">Student Name</th>
                    <th className="text-left py-4 px-4 font-semibold text-text text-sm md:text-base">Status</th>
                    <th className="text-left py-4 px-4 font-semibold text-text text-sm md:text-base">Time</th>
                    <th className="text-left py-4 px-4 font-semibold text-text text-sm md:text-base">Method</th>
                    <th className="text-right py-4 px-4 font-semibold text-text text-sm md:text-base">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceData.map((student, index) => (
                    <motion.tr key={student.id || student.name}
                      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.04 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-4 text-text/70 font-mono text-sm">{student.rollNo || '—'}</td>
                      <td className="py-4 px-4 font-semibold text-text text-sm md:text-base">{student.name}</td>
                      <td className="py-4 px-4">
                        <span className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm font-semibold inline-flex items-center gap-2 ${
                          student.status === 'present' ? 'bg-green-100 text-green-700' :
                          student.status === 'absent' ? 'bg-red-100 text-red-700' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          {student.status === 'present' && <CheckCircle size={14} />}
                          {student.status === 'absent' && <XCircle size={14} />}
                          {student.status === 'late' && <Clock size={14} />}
                          {student.status.charAt(0).toUpperCase() + student.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-text/70 text-sm">{student.time || '—'}</td>
                      <td className="py-4 px-4">
                        {student.method ? (
                          <span className={`px-2 py-1 rounded-lg text-[10px] md:text-xs font-semibold ${
                            student.method === 'auto'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}>
                            {student.method === 'auto' ? '🤖 Auto' : '✏️ Manual'}
                          </span>
                        ) : '—'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-1 md:gap-2">
                          <Button size="sm" variant="outline"
                            onClick={() => toggleAttendance(student)}
                            disabled={saving === student.name}
                            className="text-[10px] md:text-xs px-2 py-1">
                            {saving === student.name ? '...' : 'Toggle'}
                          </Button>
                          <button onClick={() => handleAddReview(student)}
                            className="p-1.5 md:p-2 hover:bg-purple-50 rounded-lg transition-colors">
                            <MessageSquare size={16} className="text-purple-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>

      {/* Info Note */}
      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <div className="text-xl md:text-2xl">ℹ️</div>
          <div>
            <h3 className="font-semibold text-blue-900 mb-1 text-sm md:text-base">How Attendance Works</h3>
            <p className="text-xs md:text-sm text-blue-800">
              Students are automatically marked present by face recognition.
              Toggle button cycles: Present → Absent → Late → Present.
              All changes are saved to the database instantly.
            </p>
          </div>
        </div>
      </Card>

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)}
        title={`Add Review for ${selectedStudent?.name}`} size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-text mb-2">Review Notes</label>
            <textarea value={reviewText} onChange={e => setReviewText(e.target.value)}
              placeholder="Write your review or notes..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-400 resize-none"
              rows="4" />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="primary" onClick={submitReview} className="flex-1 order-1 sm:order-2">
              Submit Review
            </Button>
            <Button variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1 order-2 sm:order-1">
              Cancel
            </Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={confirm.open}
        title="Are you sure?"
        message={confirm.message}
        confirmLabel="Yes, Proceed"
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />
    </div>
  );
};

export default AttendanceTab;