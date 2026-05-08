import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';
import { AuthLayout } from '../layouts';
import { Input, ButtonLoading, FormLoading } from '../components/shared';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import { apiToast } from '../utils/toast';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [formData, setFormData] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // If no token in URL, redirect to forgot-password immediately
  useEffect(() => {
    if (!token) navigate('/forgot-password', { replace: true });
  }, [token, navigate]);

  const validate = () => {
    const errs = {};
    if (!formData.password) {
      errs.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    if (!formData.confirmPassword) {
      errs.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }

    setLoading(true);
    try {
      await apiToast.operation(
        () => axios.post(API_ENDPOINTS.RESET_PASSWORD, {
          token,
          password: formData.password,
        }),
        {
          loading: 'Resetting password...',
          success: 'Password reset successfully!',
          error: 'Failed to reset password. The link may have expired.',
        }
      );
      setSuccess(true);
    } catch (err) {
      // Token expired or invalid
      setErrors({ general: 'This reset link is invalid or has expired. Please request a new one.' });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={48} className="text-green-600" />
            </div>
          </motion.div>
          <h2 className="text-3xl font-bold text-text mb-3">Password Reset! 🎉</h2>
          <p className="text-text/70 mb-8">
            Your password has been updated successfully.<br />You can now sign in with your new password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={18} />
            Back to Sign In
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your new password below"
    >
      <FormLoading loading={loading}>
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* General error (expired token etc.) */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3"
            >
              <AlertCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
              <p className="text-sm text-red-800 font-medium">{errors.general}</p>
            </motion.div>
          )}

          {/* New Password */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">New Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter new password"
                value={formData.password}
                onChange={handleChange}
                className={`w-full px-4 py-3 pl-12 pr-12 rounded-2xl border-2 border-gray-200 bg-white text-text placeholder-gray-400 transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 ${errors.password ? 'border-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">
                {errors.password}
              </motion.p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-semibold text-text mb-2">Confirm Password</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Lock size={20} />
              </div>
              <input
                type={showConfirm ? 'text' : 'password'}
                name="confirmPassword"
                placeholder="Re-enter new password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full px-4 py-3 pl-12 pr-12 rounded-2xl border-2 border-gray-200 bg-white text-text placeholder-gray-400 transition-all duration-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 ${errors.confirmPassword ? 'border-red-400' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(p => !p)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text transition-colors"
              >
                {showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </motion.p>
            )}
          </div>

          <ButtonLoading
            type="submit"
            loading={loading}
            loadingText="Resetting..."
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50"
          >
            Reset Password
          </ButtonLoading>

          <button
            type="button"
            onClick={() => navigate('/login')}
            className="w-full flex items-center justify-center gap-2 text-text/70 hover:text-text transition-colors"
          >
            <ArrowLeft size={18} />
            <span>Back to Sign In</span>
          </button>
        </form>
      </FormLoading>
    </AuthLayout>
  );
};

export default ResetPassword;
