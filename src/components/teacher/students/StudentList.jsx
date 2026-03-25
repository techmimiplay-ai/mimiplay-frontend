

// src/components/teacher/students/StudentList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Card, Input, Modal, Avatar, FileUpload } from '../../../components/shared';
import StudentEditModal from './StudentEditModal';
import { Search, Plus, Edit2, Trash2, Eye, Mail, Phone, MessageSquare, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStars } from '../../../context/StarContext';
import { API_BASE_URL } from '../../../config';

const StudentList = () => {
  const { getTotalStars, getTodayStars, getStudentResults } = useStars();

  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [reviewText, setReviewText] = useState('');
  const [formData, setFormData] = useState({ 
    name: '', rollNo: '', age: '', parentName: '', parentEmail: '', parentPhone: '', avatar: null 
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/admin/all-students-with-stats`);
      
      console.log("API Response:", res.data); // Debugging ke liye

      if (res.data && Array.isArray(res.data)) {
        const formatted = res.data.map((s, index) => ({
          id: s._id, // MongoDB ki ID ko hi main ID banayein
          studentId: s._id,
          mongoId: s._id,
          name: s.name || 'No Name',
          rollNo: s.roll_number || `00${index + 1}`,
          age: s.age || 4,
          parentName: s.parent_name || '',
          parentEmail: s.email || '',
          parentPhone: s.phone || '',
          avatar: s.avatar || null,
          avgScore: s.avg_score || 0,
          attendance: s.attendance || 0,
          status: 'active',
        }));
        setStudents(formatted);
        setError(null);
      } else {
        setStudents([]); // Agar data array nahi hai toh empty set karein
      }
    } catch (err) {
      console.error('Students fetch error:', err);
      setError('Could not load students. Check if Backend is running at ' + API_BASE_URL);
    } finally {
      setLoading(false);
    }
  };

  // Permanent Delete Function (Using Axios)
  const handleDeleteStudent = async (id) => {
    if (window.confirm('Are you sure you want to PERMANENTLY delete this student from the database?')) {
      try {
        await axios.delete(`${API_BASE_URL}/api/admin/student/${id}`);
        // List update karein bina refresh kiye
        setStudents(prev => prev.filter(s => s.id !== id));
        alert("Student deleted successfully.");
      } catch (err) {
        console.error('Delete error:', err);
        alert('Could not delete student. Check backend route.');
      }
    }
  };

  const handleAddStudent = async () => {
    try {
      await axios.post(`${API_BASE_URL}/api/admin/add-student`, {
        name: formData.name,
        rollNumber: formData.rollNo,
        age: formData.age,
        parentName: formData.parentName,
        email: formData.parentEmail,
        phone: formData.parentPhone,
      });
      await fetchStudents();
      setShowAddModal(false);
      setFormData({ name: '', rollNo: '', age: '', parentName: '', parentEmail: '', parentPhone: '', avatar: null });
    } catch (err) {
      console.error('Add student error:', err);
      alert('Could not add student.');
    }
  };

  const handleSaveStudent = async (updatedData) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/student/${selectedStudent.id}`, updatedData);
      setStudents(students.map(s => s.id === selectedStudent.id ? { ...s, ...updatedData } : s));
      setShowEditModal(false);
      setSelectedStudent(null);
    } catch (err) {
      alert("Update failed!");
    }
  };

  const filteredStudents = students.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.rollNo.toString().includes(searchQuery)
  );

  const handleViewStudent = (s) => { setSelectedStudent(s); setShowViewModal(true); };
  const handleEditStudent = (s) => { setSelectedStudent(s); setShowEditModal(true); };
  const handleAddReview = (s) => { setSelectedStudent(s); setReviewText(''); setShowReviewModal(true); };

  return (
    <div className="space-y-6 p-4">
      {/* Loading & Error States remain same as your code */}
      {loading && <div className="text-center p-10 font-bold animate-pulse">Fetching Classroom Data...</div>}
      
      {error && (
        <div className="bg-red-50 p-4 rounded-xl text-red-700 border border-red-200">
          <p>⚠️ {error}</p>
          <button onClick={fetchStudents} className="mt-2 underline font-bold">Try Again</button>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Teacher Panel: Students</h1>
        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>Add Student</Button>
      </div>

      {/* Search */}
      <Card><Input placeholder="Search..." icon={Search} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></Card>

      {/* Students Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="p-4">Student</th>
                <th className="p-4">Roll No</th>
                <th className="p-4">Stars</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.length > 0 ? filteredStudents.map((student) => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-4 flex items-center gap-3">
                    <Avatar name={student.name} />
                    <span className="font-semibold">{student.name}</span>
                  </td>
                  <td className="p-4 text-gray-600">#{student.rollNo}</td>
                  <td className="p-4 font-bold text-yellow-600">
                    ⭐ {getTotalStars(student.studentId)}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    <button onClick={() => handleViewStudent(student)} className="text-blue-600 p-2"><Eye size={18} /></button>
                    <button onClick={() => handleEditStudent(student)} className="text-yellow-600 p-2"><Edit2 size={18} /></button>
                    <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 p-2"><Trash2 size={18} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4" className="p-10 text-center text-gray-400">Database is empty or no students found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Student Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Student" size="md">
        <div className="space-y-4">
          <Input label="Student Name" placeholder="Enter full name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Roll Number" placeholder="e.g., 004" value={formData.rollNo} onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })} />
            <Input label="Age" type="number" placeholder="Age" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} />
          </div>
          <Input label="Parent Name" placeholder="Enter parent name" value={formData.parentName} onChange={(e) => setFormData({ ...formData, parentName: e.target.value })} />
          <Input label="Parent Email" type="email" icon={Mail} placeholder="parent@email.com" value={formData.parentEmail} onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })} />
          <Input label="Parent Phone" type="tel" icon={Phone} placeholder="Phone number" value={formData.parentPhone} onChange={(e) => setFormData({ ...formData, parentPhone: e.target.value })} />
          <div>
            <label className="block text-sm font-semibold text-text mb-3">Student Photo</label>
            <FileUpload accept="image/*" label="Upload Student Photo" onFileSelect={(file) => setFormData({ ...formData, avatar: file })} />
          </div>
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button variant="primary" onClick={handleAddStudent} className="flex-1">Add Student</Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* View Student Modal */}
      {selectedStudent && (
        <Modal isOpen={showViewModal} onClose={() => setShowViewModal(false)} title="Student Details" size="lg">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar size="xl" />
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-text">{selectedStudent.name}</h3>
                <p className="text-text/60">Roll No: {selectedStudent.rollNo}</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              <Card padding="sm" className="text-center">
                <p className="text-xs sm:text-sm text-text/60 mb-1">Avg Score</p>
                <p className="text-2xl sm:text-3xl font-bold text-primary-600">{selectedStudent.avgScore}/5</p>
              </Card>
              <Card padding="sm" className="text-center">
                <p className="text-xs sm:text-sm text-text/60 mb-1">Attendance</p>
                <p className="text-2xl sm:text-3xl font-bold text-green-600">{selectedStudent.attendance}%</p>
              </Card>
              <Card padding="sm" className="text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
                <div className="flex items-center justify-center gap-1 mb-1">
                  <Star size={12} className="fill-yellow-500 text-yellow-500" />
                  <p className="text-xs sm:text-sm text-yellow-700 font-semibold">Total Stars</p>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-yellow-600">
                  {getTotalStars(selectedStudent.studentId)}
                </p>
                <p className="text-xs text-yellow-600 mt-1">
                  +{getTodayStars(selectedStudent.studentId)} today
                </p>
              </Card>
            </div>
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
                          <p className="text-sm">
                            {[...Array(5)].map((_, i) => <span key={i}>{i < r.stars ? '⭐' : '☆'}</span>)}
                          </p>
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
                <p className="text-text text-sm sm:text-base"><strong>Name:</strong> {selectedStudent.parentName}</p>
                <p className="text-text text-sm sm:text-base"><strong>Email:</strong> {selectedStudent.parentEmail}</p>
                <p className="text-text text-sm sm:text-base"><strong>Phone:</strong> {selectedStudent.parentPhone}</p>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Modal */}
      <StudentEditModal
        isOpen={showEditModal}
        onClose={() => { setShowEditModal(false); setSelectedStudent(null); }}
        student={selectedStudent}
        onSave={handleSaveStudent}
      />

      {/* Review Modal */}
      <Modal isOpen={showReviewModal} onClose={() => setShowReviewModal(false)} title={`Add Review for ${selectedStudent?.name}`} size="md">
        <div className="space-y-4">
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
          <div className="flex flex-col sm:flex-row gap-3">
            {/* <Button variant="primary" onClick={submitReview} className="flex-1">Submit Review</Button> */}
            <Button variant="outline" onClick={() => setShowReviewModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

    </div>
  );
};

export default StudentList;