import React, { useState, useEffect } from 'react';
import { Card, Button, Input, Modal, Avatar, PageLoader, ConfirmModal } from '../../../components/shared';
import { Search, Plus, CheckCircle, XCircle, Eye, Mail, Phone, Building2, User } from 'lucide-react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { API_BASE_URL, getAuthHeaders } from '../../../config';

import { useToast } from '../../../context/ToastContext';

const TeacherManagement = () => {
  const toast = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState(null);
  const [confirm, setConfirm] = useState({ open: false, message: '', onConfirm: null });

  const confirmAction = (message, onConfirm) => setConfirm({ open: true, message, onConfirm });
  const closeConfirm = () => setConfirm({ open: false, message: '', onConfirm: null });

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/admin/all-users`, { headers: getAuthHeaders() })
      .then(res => {
        const data = res.data;
        if (!Array.isArray(data)) { console.error('API error:', data); return; }
        const formatted = data
          .filter(user => user.role === 'teacher')
          .map(user => ({
            id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            school: user.school || 'N/A',
            class: user.class || 'N/A',
            students: 0,
            status: user.status === 'approved' ? 'active' : 'pending',
            joinedDate: user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A',
            lastActive: 'Recently'
          }));
        setTeachers(formatted);
      })
      .catch(err => console.error('Fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  const [formData, setFormData] = useState({
    name: '', email: '', phone: '', school: '', class: '', password: ''
  });

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || teacher.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleApprove = async (teacher) => {
    try {
      await axios.put(`${API_BASE_URL}/api/admin/approve/${teacher.id}`, {}, { headers: getAuthHeaders() });
      setTeachers(prev => prev.map(t => t.id === teacher.id ? { ...t, status: 'active' } : t));
      setShowApprovalModal(false);
    } catch (err) {
      console.error('Approve error:', err);
      toast('Failed to approve. Please try again.', 'error');
    }
  };

  const handleReject = async (teacher) => {
    confirmAction(`Reject ${teacher.name}?`, async () => {
      closeConfirm();
      try {
        await axios.delete(`${API_BASE_URL}/api/admin/reject/${teacher.id}`, { headers: getAuthHeaders() });
        setTeachers(prev => prev.filter(t => t.id !== teacher.id));
        setShowApprovalModal(false);
      } catch (err) {
        console.error('Reject error:', err);
        toast('Failed to reject. Please try again.', 'error');
      }
    });
  };

  const handleDeactivate = async (teacher) => {
    confirmAction(`Deactivate ${teacher.name}?`, async () => {
      closeConfirm();
      try {
        await axios.put(`${API_BASE_URL}/api/admin/deactivate/${teacher.id}`, {}, { headers: getAuthHeaders() });
        setTeachers(prev => prev.map(t => t.id === teacher.id ? { ...t, status: 'inactive' } : t));
      } catch (err) {
        console.error('Deactivate error:', err);
        toast('Failed to deactivate. Please try again.', 'error');
      }
    });
  };

  const handleAddTeacher = async () => {
    try {
      const payload = { ...formData, email: formData.email.toLowerCase() };
      const res = await axios.post(`${API_BASE_URL}/api/admin/add-teacher`, payload, { headers: getAuthHeaders() });
      const data = res.data;
      const newTeacher = { ...formData, school: formData.school || 'N/A', class: formData.class || 'N/A', students: 0, status: 'pending', joinedDate: new Date().toLocaleDateString(), lastActive: 'Just now' };
      setTeachers(prev => [newTeacher, ...prev]);
      setFormData({ name: '', email: '', phone: '', school: '', class: '', password: '' });
      setShowAddModal(false);
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.msg || 'Error adding teacher', 'error');
    }
  };

  const handleUpdateTeacher = async () => {
    try {
      const payload = { ...editData, email: editData.email.toLowerCase() };
      await axios.put(`${API_BASE_URL}/api/admin/edit-teacher/${editData.id}`, payload, { headers: getAuthHeaders() });
      toast('Teacher updated successfully', 'success');
      setTeachers(prev => prev.map(t => t.id === editData.id ? editData : t));
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      toast(err.response?.data?.msg || 'Error updating teacher', 'error');
    }
  };

  if (loading) return <PageLoader variant="inline" emoji="👩‍🏫" text="Loading teachers…" />;

  const stats = {
    total: teachers.length,
    active: teachers.filter(t => t.status === 'active').length,
    pending: teachers.filter(t => t.status === 'pending').length,
    inactive: teachers.filter(t => t.status === 'inactive').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">Teacher Management</h1>
          <p className="text-text/60">Manage teacher accounts and approvals</p>
        </div>
        <Button variant="primary" icon={Plus} onClick={() => setShowAddModal(true)}>
          Add Teacher
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <p className="text-sm text-blue-700 mb-1">Total Teachers</p>
          <p className="text-3xl font-bold text-blue-900">{stats.total}</p>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <p className="text-sm text-green-700 mb-1">Active</p>
          <p className="text-3xl font-bold text-green-900">{stats.active}</p>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <p className="text-sm text-yellow-700 mb-1">Pending Approval</p>
          <p className="text-3xl font-bold text-yellow-900">{stats.pending}</p>
        </Card>
        <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200">
          <p className="text-sm text-gray-700 mb-1">Inactive</p>
          <p className="text-3xl font-bold text-gray-900">{stats.inactive}</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            placeholder="Search by name or email..."
            icon={Search}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-xl border-2 border-gray-200 focus:border-primary-400"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </Card>

      {/* Teachers Table */}
      <Card>
        <div className="overflow-x-auto w-full">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-4 px-4 font-semibold text-text">Teacher</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Contact</th>
                <th className="text-left py-4 px-4 font-semibold text-text hidden md:table-cell">School</th>
                <th className="text-left py-4 px-4 font-semibold text-text hidden md:table-cell">Class</th>
                <th className="text-left py-4 px-4 font-semibold text-text hidden sm:table-cell">Students</th>
                <th className="text-left py-4 px-4 font-semibold text-text">Status</th>
                <th className="text-right py-4 px-4 font-semibold text-text">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((teacher, index) => (
                <tr key={teacher.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <Avatar size="md" />
                      <div>
                        <p className="font-semibold text-text">{teacher.name}</p>
                        <p className="text-sm text-text/60">Joined: {teacher.joinedDate}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <div className="space-y-1">
                      <p className="text-sm text-text flex items-center gap-1">
                        <Mail size={14} className="text-text/60 shrink-0" />
                        <span className="truncate max-w-[120px]">{teacher.email}</span>
                      </p>
                      <p className="text-sm text-text flex items-center gap-1">
                        <Phone size={14} className="text-text/60 shrink-0" />
                        {teacher.phone}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-4 hidden md:table-cell">
                    <p className="text-sm text-text flex items-center gap-1">
                      <Building2 size={14} className="text-text/60" />
                      {teacher.school}
                    </p>
                  </td>
                  <td className="py-4 px-4 text-text/70 hidden md:table-cell">{teacher.class}</td>
                  <td className="py-4 px-4 hidden sm:table-cell">
                    <span className="font-semibold text-text">{teacher.students}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1
                      ${teacher.status === 'active' ? 'bg-green-100 text-green-700' :
                        teacher.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'}
                    `}>
                      {teacher.status === 'active' && <CheckCircle size={12} />}
                      {teacher.status.charAt(0).toUpperCase() + teacher.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => { setSelectedTeacher(teacher); setShowApprovalModal(true); }}
                        className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title="View Details">
                        <Eye size={18} className="text-blue-600" />
                      </button>
                      <button onClick={() => { setEditData(teacher); setShowEditModal(true); }}
                        className="p-2 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                        ✏️
                      </button>
                      {teacher.status === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(teacher)}
                            className="p-2 hover:bg-green-50 rounded-lg transition-colors" title="Approve">
                            <CheckCircle size={18} className="text-green-600" />
                          </button>
                          <button onClick={() => handleReject(teacher)}
                            className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Reject">
                            <XCircle size={18} className="text-red-600" />
                          </button>
                        </>
                      )}
                      {teacher.status === 'active' && (
                        <button onClick={() => handleDeactivate(teacher)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors" title="Deactivate">
                          <XCircle size={18} className="text-red-600" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Teacher Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add New Teacher" size="md">
        <div className="space-y-4">
          <Input label="Full Name" icon={User} placeholder="Enter full name"
            value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Input label="Email Address" icon={Mail} type="email" placeholder="Enter email"
            value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
          <Input label="Phone Number" icon={Phone} type="tel" placeholder="Enter phone"
            value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
          <Input label="School Name" icon={Building2} placeholder="Enter school name"
            value={formData.school} onChange={(e) => setFormData({ ...formData, school: e.target.value })} />
          <Input label="Class" placeholder="e.g., Junior KG-A"
            value={formData.class} onChange={(e) => setFormData({ ...formData, class: e.target.value })} />
          <Input label="Password" type="password" placeholder="Enter password"
            value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
          <div className="flex gap-3 mt-6">
            <Button variant="primary" onClick={handleAddTeacher} className="flex-1">Add Teacher</Button>
            <Button variant="outline" onClick={() => setShowAddModal(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </Modal>

      {/* Edit Teacher Modal */}
      {editData && (
        <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Teacher" size="md">
          <div className="space-y-4">
            <Input label="Full Name" value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
            <Input label="Email" value={editData.email}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })} />
            <Input label="Phone" value={editData.phone}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })} />
            <Input label="School" value={editData.school}
              onChange={(e) => setEditData({ ...editData, school: e.target.value })} />
            <Input label="Class" value={editData.class}
              onChange={(e) => setEditData({ ...editData, class: e.target.value })} />
            <div className="flex gap-3 mt-6">
              <Button variant="primary" onClick={handleUpdateTeacher} className="flex-1">Save Changes</Button>
              <Button variant="outline" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* View/Approval Modal */}
      {selectedTeacher && (
        <Modal isOpen={showApprovalModal} onClose={() => setShowApprovalModal(false)} title="Teacher Details" size="md">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b">
              <Avatar size="xl" />
              <div>
                <h3 className="text-xl sm:text-2xl font-bold text-text">{selectedTeacher.name}</h3>
                <span className={`
                  inline-block px-3 py-1 rounded-full text-sm font-semibold mt-1
                  ${selectedTeacher.status === 'active' ? 'bg-green-100 text-green-700' :
                    selectedTeacher.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'}
                `}>
                  {selectedTeacher.status.charAt(0).toUpperCase() + selectedTeacher.status.slice(1)}
                </span>
              </div>
            </div>
            <div className="space-y-3 bg-gray-50 rounded-2xl p-4">
              <div className="flex items-center gap-2">
                <Mail size={18} className="text-text/60 shrink-0" />
                <span className="text-text truncate">{selectedTeacher.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="text-text/60 shrink-0" />
                <span className="text-text">{selectedTeacher.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building2 size={18} className="text-text/60 shrink-0" />
                <span className="text-text">{selectedTeacher.school}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-blue-700 mb-1">Class</p>
                <p className="text-xl font-bold text-blue-900">{selectedTeacher.class}</p>
              </div>
              <div className="bg-green-50 rounded-2xl p-4 text-center">
                <p className="text-sm text-green-700 mb-1">Students</p>
                <p className="text-xl font-bold text-green-900">{selectedTeacher.students}</p>
              </div>
            </div>
            {selectedTeacher.status === 'pending' && (
              <div className="flex gap-3 mt-6">
                <Button variant="primary" icon={CheckCircle} onClick={() => handleApprove(selectedTeacher)} className="flex-1">Approve</Button>
                <Button variant="outline" icon={XCircle} onClick={() => handleReject(selectedTeacher)} className="flex-1">Reject</Button>
              </div>
            )}
          </div>
        </Modal>
      )}
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

export default TeacherManagement;
