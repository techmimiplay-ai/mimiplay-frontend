import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts';
import { Button, Input, ButtonLoading, FormLoading } from '../components/shared';
import { User, Mail, Lock, Phone, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../config';
import axios from 'axios';
import { handleError } from '../utils/errorHandler';
import { showToast, apiToast } from '../utils/toast.jsx';

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    role: 'teacher',
    school: '',
    password: '',
    confirmPassword: '',
    childName: '',
    rollNumber: '',
    agreeToTerms: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!formData.fullName) {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone number must be 10 digits';
    }
    
    if (!formData.school && formData.role === 'teacher') {
      newErrors.school = 'School name is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    if (formData.role === 'parent') {
      if (!formData.childName) {
        newErrors.childName = 'Child name is required';
      }
      if (!formData.rollNumber) {
        newErrors.rollNumber = 'Student roll number is required';
      }
    }

    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the terms';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      showToast.warning('Please fix the errors below');
      return;
    }
    
    setLoading(true);
    
    try {
      await apiToast.operation(
        () => axios.post(API_ENDPOINTS.REGISTER, {
          ...formData,
          email: formData.email.toLowerCase()
        }),
        {
          loading: 'Creating your account...',
          success: 'Account created successfully! Pending admin approval.',
          error: 'Failed to create account. Please try again.'
        }
      );
      
      setTimeout(() => navigate('/login'), 2000);
      
    } catch (err) {
      console.error('Registration error:', err);
      // Error already handled by apiToast
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join Alexi Smart Learning Platform"
    >
      <FormLoading loading={loading}>
        <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name */}
        <Input
          label="Full Name"
          type="text"
          name="fullName"
          placeholder="Enter your full name"
          icon={User}
          value={formData.fullName}
          onChange={handleChange}
          error={errors.fullName}
        />
        
        {/* Email */}
        <Input
          label="Email Address"
          type="email"
          name="email"
          placeholder="Enter your email"
          icon={Mail}
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
        />
        
        {/* Phone */}
        <Input
          label="Phone Number"
          type="tel"
          name="phone"
          placeholder="Enter your phone number"
          icon={Phone}
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
        />
        
        {/* Role Selection */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            I am a
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'teacher' }))}
              className={`
                px-4 py-3 rounded-2xl border-2 font-semibold transition-all
                ${formData.role === 'teacher'
                  ? 'border-primary-400 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-text hover:border-gray-300'
                }
              `}
            >
              👨🏫 Teacher
            </button>
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, role: 'parent' }))}
              className={`
                px-4 py-3 rounded-2xl border-2 font-semibold transition-all
                ${formData.role === 'parent'
                  ? 'border-primary-400 bg-primary-50 text-primary-600'
                  : 'border-gray-200 text-text hover:border-gray-300'
                }
              `}
            >
              👨👩👧 Parent
            </button>
          </div>
        </div>
        
        {/* School Name (only for teachers) */}
        {formData.role === 'teacher' && (
          <Input
            label="School Name"
            type="text"
            name="school"
            placeholder="Enter school name"
            icon={Building2}
            value={formData.school}
            onChange={handleChange}
            error={errors.school}
          />
        )}

        {/* Child Info (only for parents) */}
        {formData.role === 'parent' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4"
          >
            <Input
              label="Child's Full Name"
              type="text"
              name="childName"
              placeholder="Enter student's full name"
              icon={User}
              value={formData.childName}
              onChange={handleChange}
              error={errors.childName}
            />
            <Input
              label="Student Roll Number"
              type="text"
              name="rollNumber"
              placeholder="Enter student's roll number"
              icon={Building2}
              value={formData.rollNumber}
              onChange={handleChange}
              error={errors.rollNumber}
            />
          </motion.div>
        )}

        
        {/* Password */}
        <Input
          label="Password"
          type="password"
          name="password"
          placeholder="Create a password"
          icon={Lock}
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
        />
        
        {/* Confirm Password */}
        <Input
          label="Confirm Password"
          type="password"
          name="confirmPassword"
          placeholder="Re-enter your password"
          icon={Lock}
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
        
        {/* Terms & Conditions */}
        <div>
          <label className="flex items-start gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="w-4 h-4 mt-1 rounded border-gray-300 text-primary-500 focus:ring-primary-400"
            />
            <span className="text-sm text-text">
              I agree to the Terms & Conditions and Privacy Policy
            </span>
          </label>
          {errors.agreeToTerms && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.agreeToTerms}
            </motion.p>
          )}
        </div>
        
        {/* Submit Button */}
        <ButtonLoading
          type="submit"
          loading={loading}
          loadingText="Creating Account..."
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50"
        >
          Create Account
        </ButtonLoading>
        
        {/* Info Message */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
          <p className="text-sm text-blue-800">
            ℹ️ Your account will be reviewed by an administrator before you can access the platform.
          </p>
        </div>
        
        {/* Login Link */}
        <p className="text-center text-sm text-text/60 mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="text-primary-600 font-semibold hover:text-primary-700"
          >
            Sign In
          </button>
        </p>
      </form>
      </FormLoading>
    </AuthLayout>
  );
};

export default Register;