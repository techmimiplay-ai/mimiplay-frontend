import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Input, Modal, Avatar, FileUpload, PageLoader, ConfirmModal } from '../../../components/shared';
import StudentEditModal from './StudentEditModal';
import { Search, Plus, Edit2, Trash2, Eye, Mail, Phone, MessageSquare, Star, Camera, CheckCircle, Loader } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStars } from '../../../context/StarContext';
import { useToast } from '../../../context/ToastContext';
import { API_ENDPOINTS } from '../../../config';
import { apiRequest } from '../../../utils/api';
 
const StudentList = () => {
  const { getTotalStars, getTodayStars, getTodayActivities, getStudentResults } = useStars();
  const toast = useToast();
 
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
 
  // ── Parents list for dropdown ──────────────────────────────────────────────
  const [parents, setParents] = useState([]);
 
  useEffect(() => {
    fetchStudents();
    fetchParents();
  }, []);
 
  const fetchParents = async () => {
    try {
      const res = await apiRequest('get', API_ENDPOINTS.TEACHER_ALL_PARENTS);
      if (Array.isArray(res)) {
        setParents(res);
      }
    } catch (err) {
      console.error('Parents fetch error:', err);
    }
  };
 
  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('get', API_ENDPOINTS.ADMIN_ALL_STUDENTS_WITH_STATS);
 
      const formatted = res.map((s, index) => ({
        id: s._id,
        studentId: s._id,
        mongoId: s._id,
        name: s.name || '',
        rollNo: s.roll_number || `00${index + 1}`,
        age: s.age || 4,
        parentName: s.parent_name || '',
        parentEmail: s.email || '',
        parentPhone: s.phone || '',
        avatar: null,
        avgScore: s.avg_score || 0,
        attendance: s.attendance || 0,
        faceRegistered: s.face_registered || false,
        status: 'active',
      }));
 
      setStudents(formatted);
      setError(null);
    } catch (err) {
      console.error('Students fetch error:', err);
      setError('Could not load students. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };
 
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddParentModal, setShowAddParentModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });
  const [reviewText, setReviewText] = useState('');
  const [existingReviewId, setExistingReviewId] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
 
  // ── Add form state ──────────────────────────────────────────────────────────
  const [formData, setFormData] = useState({
    name: '', rollNo: '', age: '', class: '',
    parentId: '', parentName: '',
    parentEmail: '', parentPhone: '', avatar: null
  });
 
  // ── Parent dropdown handler ─────────────────────────────────────────────────
  const handleParentChange = (e) => {
    const parentId = e.target.value;
    const selectedParent = parents.find(p => p._id === parentId);
    if (selectedParent) {
      setFormData({
        ...formData,
        parentId: parentId,
        parentName: selectedParent.name || '',
        parentEmail: selectedParent.email || '',
        parentPhone: selectedParent.phone || ''
      });
    } else {
      setFormData({ ...formData, parentId: '', parentName: '', parentEmail: '', parentPhone: '' });
    }
  };
 
  // ── Submit state ────────────────────────────────────────────────────────────
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(''); // 'adding' | 'registering_face' | ''
 
  const confirmAction = (message, onConfirm) => setConfirm({ open: true, message, onConfirm });
  const closeConfirm = () => setConfirm({ open: false, message: '', onConfirm: null });
  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.includes(searchQuery)
  );
 
  // ── Get auth headers from localStorage ─────────────────────────────────────
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  };
 
  // ── Convert file to base64 ──────────────────────────────────────────────────
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result); // includes data:image/...;base64,
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };
 
  // ── MAIN: Add student + register face ──────────────────────────────────────
  const handleAddStudent = async () => {
    if (!formData.name.trim()) {
      alert('Student name is required');
      return;
    }
 
    setIsSubmitting(true);
    setSubmitStatus('adding');
 
    try {
      // STEP 1: Student DB mein save karo
      await apiRequest('post', API_ENDPOINTS.ADMIN_ADD_STUDENT, {
        name: formData.name,
        rollNumber: formData.rollNo,
        age: formData.age,
        class: formData.class,
        parentName: formData.parentName,
        parent_id: formData.parentId,
        email: formData.parentEmail,
        phone: formData.parentPhone,
      });

      // STEP 2: Agar photo select ki hai toh face register karo
      if (formData.avatar) {
        setSubmitStatus('registering_face');

        try {
          const base64Image = await fileToBase64(formData.avatar);

          const faceRes = await apiRequest('post', API_ENDPOINTS.REGISTER_FACE, {
            name: formData.name,
            image: base64Image,
          });

          if (faceRes.status === 'error') {
            await fetchStudents();
            resetForm();
            toast(`Student added! Face registration failed: ${faceRes.message}`, 'warning');
            return;
          }

          await fetchStudents();
          resetForm();
          toast('Student added and face registered successfully!', 'success');

        } catch (faceErr) {
          console.error('Face register error:', faceErr);
          await fetchStudents();
          resetForm();
          if (faceErr.response?.status === 409) {
            toast('Student added! Face already registered.', 'info');
          } else {
            toast(`Student added! Face registration failed: ${faceErr.response?.data?.message || faceErr.message}`, 'warning');
          }
        }

      } else {
        await fetchStudents();
        resetForm();
        toast('Student added. No photo — face recognition will not work.', 'warning');
      }

    } catch (err) {
      console.error('Add student error:', err);
      toast(`Could not add student: ${err.response?.data?.msg || err.message}`, 'error');
    } finally {
      setIsSubmitting(false);
      setSubmitStatus('');
    }
  };
 
  const resetForm = () => {
    setFormData({ name: '', rollNo: '', age: '', class: '', parentId: '', parentName: '', parentEmail: '', parentPhone: '', avatar: null });
    setShowAddModal(false);
  };

  // ── Add Parent form ─────────────────────────────────────────────────────────
  const [parentForm, setParentForm] = useState({ name: '', email: '', phone: '', password: '', childName: '', rollNumber: '' });
  const [addingParent, setAddingParent] = useState(false);

  const handleAddParent = async () => {
    if (!parentForm.name.trim() || !parentForm.email.trim() || !parentForm.password.trim()) {
      toast('Name, email and password are required', 'error');
      return;
    }
    setAddingParent(true);
    try {
      await apiRequest('post', API_ENDPOINTS.TEACHER_ADD_PARENT, parentForm);
      toast('Parent added and auto-approved!', 'success');
      setParentForm({ name: '', email: '', phone: '', password: '', childName: '', rollNumber: '' });
      setShowAddParentModal(false);
      fetchParents(); // refresh dropdown
    } catch (err) {
      toast(`Could not add parent: ${err.response?.data?.message || err.message}`, 'error');
    } finally {
      setAddingParent(false);
    }
  };
 
  const getSubmitLabel = () => {
    if (submitStatus === 'adding') return 'Adding Student...';
    if (submitStatus === 'registering_face') return 'Registering Face...';
    return 'Add Student';
  };
 
  // ── Other handlers ──────────────────────────────────────────────────────────
  const handleViewStudent = (s) => { setSelectedStudent(s); setShowViewModal(true); };
  const handleEditStudent = (s) => { setSelectedStudent(s); setShowEditModal(true); };
  const handleAddReview = async (s) => {
    setSelectedStudent(s);
    setReviewText('');
    setExistingReviewId(null);
    setReviewLoading(true);
    setShowReviewModal(true);
    try {
      const res = await apiRequest('get', API_ENDPOINTS.TEACHER_GET_REVIEWS(s.studentId));
      if (res?.status === 'success' && res.reviews?.length > 0) {
        const latest = res.reviews[0];
        setReviewText(latest.review);
        setExistingReviewId(latest.id);
      }
    } catch (err) {
      console.error('Fetch reviews error:', err);
    } finally {
      setReviewLoading(false);
    }
  };
  const handleDeleteStudent = async (id) => {
    confirmAction('Are you sure you want to remove this student?', async () => {
      closeConfirm();
      try {
        await apiRequest('delete', API_ENDPOINTS.ADMIN_DELETE_STUDENT(id));
        setStudents(prev => prev.filter(s => s.id !== id));
        toast('Student removed.', 'success');
      } catch (err) {
        console.error('Delete student error:', err);
        toast(`Could not delete student: ${err.response?.data?.msg || err.message}`, 'error');
      }
    });
  };
  const handleSaveStudent = async (updatedData) => {
    try {
      await apiRequest('put', API_ENDPOINTS.ADMIN_EDIT_STUDENT(selectedStudent.studentId), {
        name:        updatedData.name,
        rollNumber:  updatedData.rollNo,
        parentName:  updatedData.parentName,
        email:       updatedData.parentEmail,
        phone:       updatedData.parentPhone,
        parent_id:   updatedData.parentId || undefined,
      });
      setStudents(prev => prev.map(s =>
        s.id === selectedStudent.id ? { ...s, ...updatedData } : s
      ));
      toast('Student updated successfully.', 'success');
    } catch (err) {
      console.error('Edit student error:', err);
      toast(`Could not update student: ${err.response?.data?.msg || err.message}`, 'error');
    } finally {
      setShowEditModal(false);
      setSelectedStudent(null);
    }
  };
  const submitReview = async () => {
    if (!reviewText.trim()) return;
    try {
      if (existingReviewId) {
        await apiRequest('put', API_ENDPOINTS.TEACHER_UPDATE_REVIEW(existingReviewId), { review: reviewText });
      } else {
        await apiRequest('post', API_ENDPOINTS.TEACHER_ADD_REVIEW, {
          student_id: selectedStudent.studentId,
          student_name: selectedStudent.name,
          review: reviewText,
        });
      }
      setShowReviewModal(false);
      setReviewText('');
      setExistingReviewId(null);
      setSelectedStudent(null);
    } catch (err) {
      console.error('Review error:', err);
      toast(`Could not save review: ${err.response?.data?.msg || err.message}`, 'error');
    }
  };
 

  return (
    <div className="space-y-6">
      {loading && <PageLoader variant="inline" emoji="👦" text="Loading students…" />}
 
      {/* Error State */}
      {error && (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <p className="font-bold text-red-700">Database Error</p>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
          <button onClick={fetchStudents} className="ml-auto px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600">
            Retry
          </button>
        </div>
      )}
 
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-text mb-2">Students</h1>
          <p className="text-text/60">Manage your classroom students</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" icon={Plus} onClick={() => setShowAddParentModal(true)}>
            Add Parent
          </Button>
          <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
            Add Student
          </Button>
        </div>
      </div>
 
      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Total Students</p>
          <p className="text-3xl font-bold text-blue-900">{students.length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-green-700 mb-1">Active</p>
          <p className="text-3xl font-bold text-green-900">{students.filter(s => s.status === 'active').length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <p className="text-sm text-purple-700 mb-1">Face Registered</p>
          <p className="text-3xl font-bold text-purple-900">{students.filter(s => s.faceRegistered).length}</p>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-2 mb-1">
            <Star size={16} className="fill-orange-500 text-orange-500" />
            <p className="text-sm text-orange-700 font-semibold">Total Stars</p>
          </div>
          <p className="text-3xl font-bold text-orange-900">
            {students.reduce((sum, s) => sum + getTotalStars(s.studentId), 0)}
          </p>
          <p className="text-xs text-orange-600 mt-1">
            {students.reduce((sum, s) => sum + getTodayStars(s.studentId), 0) > 0
              ? `+${students.reduce((sum, s) => sum + getTodayStars(s.studentId), 0)} today ⚡`
              : 'All students combined ⭐'}
          </p>
        </Card>
      </div>
 
      {/* Search */}
      <Card>
        <Input
          placeholder="Search by name or roll number..."
          icon={Search}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </Card>
 
      {/* Students Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-text">Student</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Roll No</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Age</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Parent</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Avg Score</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Attendance</th>
                <th className="text-left py-4 px-4 font-semibold text-text">
                  <div className="flex items-center gap-1">
                    <Camera size={14} className="text-purple-500" />
                    Face
                  </div>
                </th>
                <th className="text-left py-4 px-4 font-semibold text-text">
                  <div className="flex items-center gap-1">
                    <Star size={14} className="fill-yellow-400 text-yellow-400" />
                    Stars
                  </div>
                </th>
                <th className="text-right py-4 px-4 font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const liveStars = getTotalStars(student.studentId);
                const todayStars = getTodayStars(student.studentId);
                return (
                  <tr key={student.studentId} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <Avatar size="md" />
                        <span className="font-semibold text-text">{student.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-text/70">{student.rollNo}</td>
                    <td className="py-4 px-4 text-text/70">{student.age} yrs</td>
                    <td className="py-4 px-4 text-text/70">{student.parentName}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-text">{student.avgScore}</span>
                        <span className="text-text/50">/5</span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${student.attendance >= 95 ? 'bg-green-100 text-green-700' :
                        student.attendance >= 85 ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'}`}>
                        {student.attendance}%
                      </span>
                    </td>
 
                    {/* ── FACE REGISTERED COLUMN ── */}
                    <td className="py-4 px-4">
                      {student.faceRegistered ? (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 w-fit">
                          <CheckCircle size={12} /> Done
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400 w-fit">
                          <Camera size={12} /> No
                        </span>
                      )}
                    </td>
 
                    {/* ── STARS COLUMN ── */}
                    <td className="py-4 px-4">
                      <motion.div
                        key={liveStars}
                        initial={{ scale: 1.4, backgroundColor: '#fef08a' }}
                        animate={{ scale: 1, backgroundColor: '#ffffff00' }}
                        transition={{ duration: 0.5 }}
                        className="flex flex-col gap-1 rounded-xl px-1"
                      >
                        <div className="flex items-center gap-1">
                          <span className="text-lg">⭐</span>
                          <span className="font-bold text-text text-lg">{liveStars}</span>
                        </div>
                        {todayStars > 0 && (
                          <div className="text-xs text-green-600 font-semibold bg-green-50 rounded-full px-2 py-0.5 w-fit">
                            +{todayStars} today
                          </div>
                        )}
                      </motion.div>
                    </td>
 
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => handleViewStudent(student)} className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                          <Eye size={18} className="text-blue-600" />
                        </button>
                        <button onClick={() => handleAddReview(student)} className="p-2 hover:bg-purple-50 rounded-lg transition-colors" title="Add Review">
                          <MessageSquare size={18} className="text-purple-600" />
                        </button>
                        <button onClick={() => handleEditStudent(student)} className="p-2 hover:bg-yellow-50 rounded-lg transition-colors" title="Edit">
                          <Edit2 size={18} className="text-yellow-600" />
                        </button>
                        <button onClick={() => handleDeleteStudent(student.id)} className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                          <Trash2 size={18} className="text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
 
      {/* ── ADD STUDENT MODAL ──────────────────────────────────────────────────── */}
      <Modal isOpen={showAddModal} onClose={() => !isSubmitting && resetForm()} title="Add New Student" size="md">
        <div className="space-y-4">
          <Input
            label="Student Name *"
            placeholder="Enter full name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Roll Number"
              placeholder="e.g., 004"
              value={formData.rollNo}
              onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
            />
            <Input
              label="Age"
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
            />
          </div>
          <Input
            label="Class"
            placeholder="e.g. Junior KG-A, Senior KG-B"
            value={formData.class}
            onChange={(e) => setFormData({ ...formData, class: e.target.value })}
          />
 
          {/* ── Parent Dropdown ── */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-1">
              Link to Parent Account
            </label>
            <div className="relative">
              <svg className="absolute left-4 top-3.5 text-gray-400 w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              <select
                className="w-full border rounded-full py-3 pl-12 pr-4 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={formData.parentId}
                onChange={handleParentChange}
              >
                <option value="">Select Parent Account</option>
                {parents.map((p) => (
                  <option key={p._id} value={p._id}>{p.name} — {p.email}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-text/50">Don't see the parent? Use <strong>Add Parent</strong> first.</p>
          </div>
 
          {/* ── PHOTO UPLOAD ── */}
          <div>
            <label className="block text-sm font-semibold text-text mb-1 flex items-center gap-2">
              <Camera size={15} className="text-purple-500" />
              Student Photo
              <span className="text-xs text-gray-400 font-normal">(Required for face recognition)</span>
            </label>
            <FileUpload
              accept="image/*"
              label="Upload Student Photo"
              onFileSelect={(file) => setFormData({ ...formData, avatar: file })}
            />
          </div>
 
          {/* ── LOADING STATUS ── */}
          {isSubmitting && (
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-3">
              <Loader size={18} className="text-blue-600 animate-spin shrink-0" />
              <div>
                <p className="text-sm font-semibold text-blue-700">{getSubmitLabel()}</p>
                <p className="text-xs text-blue-500">
                  {submitStatus === 'adding' && 'Saving student info to database...'}
                  {submitStatus === 'registering_face' && 'Processing face image and saving to MongoDB...'}
                </p>
              </div>
            </div>
          )}
 
          <div className="flex gap-3 mt-6">
            <Button
              variant="primary"
              onClick={handleAddStudent}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? getSubmitLabel() : 'Add Student'}
            </Button>
            <Button
              variant="outline"
              onClick={resetForm}
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </Modal>
 
      {/* ── View Student Modal ─────────────────────────────────────────────────── */}
      {selectedStudent && (
        <Modal key={selectedStudent.studentId} isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Student Details" size="lg">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar size="xl" />
              <div>
                <h3 className="text-2xl font-bold text-text">{selectedStudent.name}</h3>
                <p className="text-text/60">Roll No: {selectedStudent.rollNo}</p>
                <p className="text-sm mt-1">
                  {selectedStudent.faceRegistered
                    ? <span className="text-green-600 font-semibold">✅ Face Registered</span>
                    : <span className="text-gray-400">📷 Face not registered</span>
                  }
                </p>
              </div>
            </div>
 
            <div className="grid grid-cols-3 gap-4">
              <Card padding="sm" className="text-center">
                <p className="text-sm text-text/60 mb-1">Avg Score</p>
                <p className="text-3xl font-bold text-primary-600">{selectedStudent.avgScore}/5</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-sm text-text/60 mb-1">Attendance</p>
                <p className="text-3xl font-bold text-green-600">{selectedStudent.attendance}%</p>
              </Card>
              <Card padding="sm" className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star size={14} className="fill-yellow-500 text-yellow-500" />
                  <p className="text-sm text-yellow-700 font-semibold">Total Stars</p>
                </div>
                <p className="text-3xl font-bold text-yellow-600">{getTotalStars(selectedStudent.studentId)}</p>
                <p className="text-xs text-yellow-600 mt-1">+{getTodayStars(selectedStudent.studentId)} today</p>
              </Card>
            </div>
 
            {/* Activity history */}
            {(() => {
              const history = getStudentResults(selectedStudent.studentId);
              return history.length > 0 ? (
                <div>
                  <h4 className="font-semibold text-text mb-3">Recent Activity History</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {history.slice(0, 10).map((r) => (
                      <motion.div key={r.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                        <div>
                          <p className="font-semibold text-text text-sm">{r.activityName}</p>
                          <p className="text-xs text-text/50">
                            {new Date(r.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{[...Array(5)].map((_, i) => <span key={i}>{i < r.stars ? '⭐' : '☆'}</span>)}</p>
                          <p className="text-xs text-text/50">{r.score}%</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-text/40">
                  <p>No activities completed yet.</p>
                  <p className="text-sm">Launch an activity from the Activities tab!</p>
                </div>
              );
            })()}
 
            <div>
              <h4 className="font-semibold text-text mb-3">Parent Information</h4>
              <div className="space-y-2 bg-gray-50 rounded-2xl p-4">
                <p className="text-text"><strong>Name:</strong> {selectedStudent.parentName}</p>
                <p className="text-text"><strong>Email:</strong> {selectedStudent.parentEmail}</p>
                <p className="text-text"><strong>Phone:</strong> {selectedStudent.parentPhone}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}
 
      {/* ── Edit Modal ─────────────────────────────────────────────────────────── */}
      <ConfirmModal
        isOpen={confirm.open}
        title="Are you sure?"
        message={confirm.message}
        confirmLabel="Yes, Remove"
        onConfirm={confirm.onConfirm}
        onCancel={closeConfirm}
      />

      <StudentEditModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedStudent(null); }}
        student={selectedStudent}
        onSave={handleSaveStudent}
      />
 
      {/* ── Review Modal ───────────────────────────────────────────────────────── */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title={existingReviewId ? `Edit Review — ${selectedStudent?.name}` : `Add Review — ${selectedStudent?.name}`} size="md">
        <div className="space-y-4">
          {reviewLoading ? (
            <div className="text-center py-6 text-text/50">Loading existing review…</div>
          ) : (
            <>
              {existingReviewId && (
                <div className="px-3 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-700 font-semibold">
                  ✏️ Editing your most recent review for this student
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-text mb-2">Review Notes</label>
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Write your review or notes for this student..."
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-primary-400 resize-none"
                  rows="4"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="primary" onClick={submitReview} className="flex-1">
                  {existingReviewId ? 'Update Review' : 'Submit Review'}
                </Button>
                <Button variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">Cancel</Button>
              </div>
            </>
          )}
        </div>
      </Modal>
      {/* ── Add Parent Modal ───────────────────────────────────────────────────────── */}
      <Modal isOpen={showAddParentModal} onClose={() => setShowAddParentModal(false)} title="Add Parent (Auto-Approved)" size="md">
        <div className="space-y-4">
          <div className="px-3 py-2 bg-green-50 border border-green-200 rounded-xl text-xs text-green-700 font-semibold">
            ✅ Parents added by teacher are automatically approved — no admin action needed
          </div>
          <Input label="Full Name *" placeholder="Parent full name" value={parentForm.name}
            onChange={e => setParentForm({ ...parentForm, name: e.target.value })} />
          <Input label="Email *" type="email" placeholder="parent@email.com" value={parentForm.email}
            onChange={e => setParentForm({ ...parentForm, email: e.target.value })} />
          <Input label="Phone" type="tel" placeholder="Phone number" value={parentForm.phone}
            onChange={e => setParentForm({ ...parentForm, phone: e.target.value })} />
          <Input label="Password *" type="password" placeholder="Set a login password" value={parentForm.password}
            onChange={e => setParentForm({ ...parentForm, password: e.target.value })} />
          <Input label="Child Name" placeholder="Student's name" value={parentForm.childName}
            onChange={e => setParentForm({ ...parentForm, childName: e.target.value })} />
          <Input label="Roll Number" placeholder="Student's roll number" value={parentForm.rollNumber}
            onChange={e => setParentForm({ ...parentForm, rollNumber: e.target.value })} />
          <div className="flex gap-3">
            <Button variant="primary" onClick={handleAddParent} className="flex-1" disabled={addingParent}>
              {addingParent ? 'Adding...' : 'Add Parent'}
            </Button>
            <Button variant="outline" onClick={() => setShowAddParentModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
 
export default StudentList;