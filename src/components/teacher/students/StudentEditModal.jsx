import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, FileUpload } from '../../shared';
import { Save, X } from 'lucide-react';
import { motion } from 'framer-motion';

const StudentEditModal = ({ isOpen, onClose, student, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    rollNo: '',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    avatar: null,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen && student) {
      setFormData({
        name: student.name || '',
        age: student.age || '',
        rollNo: student.rollNo || '',
        parentName: student.parentName || '',
        parentEmail: student.parentEmail || '',
        parentPhone: student.parentPhone || '',
        avatar: null,
      });
      setErrors({});
    }
  }, [isOpen, student]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.age || formData.age < 3 || formData.age > 12) newErrors.age = 'Valid age required (3-12)';
    if (!formData.rollNo.trim()) newErrors.rollNo = 'Roll number is required';
    if (!formData.parentName.trim()) newErrors.parentName = 'Parent name is required';
    if (!formData.parentEmail.trim()) newErrors.parentEmail = 'Parent email is required';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.parentEmail)) {
      newErrors.parentEmail = 'Valid email required';
    }
    if (!formData.parentPhone.trim()) newErrors.parentPhone = 'Parent phone is required';
    if (!/^\d{10}$/.test(formData.parentPhone.replace(/\D/g, ''))) {
      newErrors.parentPhone = 'Valid 10-digit phone required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileSelect = (file) => {
    setFormData(prev => ({ ...prev, avatar: file }));
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSave(formData);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Student Information">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Student Information */}
        <div className="space-y-3">
          <h4 className="font-semibold text-text text-sm">Student Details</h4>
          {/* SM: stack, MD+: grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-2">Student Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Enter student name"
                className={`w-full px-3 py-2 rounded-lg border-2 text-sm focus:outline-none ${
                  errors.name ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-400'
                }`}
              />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-2">Age</label>
              <input
                type="number"
                name="age"
                value={formData.age}
                onChange={handleChange}
                placeholder="Age"
                min="3"
                max="12"
                className={`w-full px-3 py-2 rounded-lg border-2 text-sm focus:outline-none ${
                  errors.age ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-400'
                }`}
              />
              {errors.age && <p className="text-xs text-red-600 mt-1">{errors.age}</p>}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-text mb-2">Roll Number</label>
            <input
              type="text"
              name="rollNo"
              value={formData.rollNo}
              onChange={handleChange}
              placeholder="Enter roll number"
              className={`w-full px-3 py-2 rounded-lg border-2 text-sm focus:outline-none ${
                errors.rollNo ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-400'
              }`}
            />
            {errors.rollNo && <p className="text-xs text-red-600 mt-1">{errors.rollNo}</p>}
          </div>
        </div>

        {/* Photo Upload */}
        <div className="border-t-2 border-gray-200 pt-4">
          <h4 className="font-semibold text-text text-sm mb-3">Student Photo</h4>
          <FileUpload
            accept="image/*"
            label="Upload Student Photo"
            onFileSelect={handleFileSelect}
          />
        </div>

        {/* Parent Information */}
        <div className="border-t-2 border-gray-200 pt-4">
          <h4 className="font-semibold text-text text-sm mb-3">Parent Information</h4>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-text mb-2">Parent Name</label>
              <input
                type="text"
                name="parentName"
                value={formData.parentName}
                onChange={handleChange}
                placeholder="Enter parent name"
                className={`w-full px-3 py-2 rounded-lg border-2 text-sm focus:outline-none ${
                  errors.parentName ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-400'
                }`}
              />
              {errors.parentName && <p className="text-xs text-red-600 mt-1">{errors.parentName}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-2">Parent Email</label>
              <input
                type="email"
                name="parentEmail"
                value={formData.parentEmail}
                onChange={handleChange}
                placeholder="Enter parent email"
                className={`w-full px-3 py-2 rounded-lg border-2 text-sm focus:outline-none ${
                  errors.parentEmail ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-400'
                }`}
              />
              {errors.parentEmail && <p className="text-xs text-red-600 mt-1">{errors.parentEmail}</p>}
            </div>
            <div>
              <label className="block text-xs font-semibold text-text mb-2">Parent Phone</label>
              <input
                type="tel"
                name="parentPhone"
                value={formData.parentPhone}
                onChange={handleChange}
                placeholder="Enter phone number"
                className={`w-full px-3 py-2 rounded-lg border-2 text-sm focus:outline-none ${
                  errors.parentPhone ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-primary-400'
                }`}
              />
              {errors.parentPhone && <p className="text-xs text-red-600 mt-1">{errors.parentPhone}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 mt-6">
        <Button variant="outline" icon={X} onClick={onClose} fullWidth>
          Cancel
        </Button>
        <Button variant="primary" icon={Save} onClick={handleSubmit} fullWidth>
          Save Changes
        </Button>
      </div>
    </Modal>
  );
};

export default StudentEditModal;