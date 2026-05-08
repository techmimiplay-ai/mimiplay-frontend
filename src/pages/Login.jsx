import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthLayout } from '../layouts';
import { Button, Input, ButtonLoading } from '../components/shared';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../config';
import axios from 'axios';
import { handleError } from '../utils/errorHandler';
import { showToast } from '../utils/toast';

const Login = () => {
  const navigate = useNavigate(); // ← ADD THIS
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({}); // Clear previous errors

    try {
      console.log("[Login] Attempting call to:", API_ENDPOINTS.LOGIN);
      
      const res = await axios.post(API_ENDPOINTS.LOGIN, {
        email: formData.email.toLowerCase(),
        password: formData.password,
      });

      const data = res.data;

      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.role);
      localStorage.setItem("userId", data.user_id);
      localStorage.setItem("user", JSON.stringify({ name: data.name, email: formData.email.toLowerCase() }));

      showToast.success('Welcome back! Redirecting...');
      
      // Redirect all roles to the unified selection screen
      navigate('/select');

    } catch (err) {
      console.error("[Login] Exception:", err);
      
      // Handle specific error cases
      if (err.response?.status === 403 && err.response?.data?.msg?.toLowerCase().includes('approval')) {
        setErrors({ pending: true });
      } else {
        // Use centralized error handling
        const errorInfo = handleError(err, { showToast: false });
        setErrors({ general: errorInfo.message });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome Back!"
      subtitle="Sign in to continue to Alexi"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Pending approval banner */}
        {errors.pending && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3"
          >
            <span className="text-xl">⏳</span>
            <div>
              <p className="text-sm font-bold text-amber-800">Account Pending Approval</p>
              <p className="text-sm text-amber-700 mt-0.5">
                Your account is waiting for admin approval. You'll be able to log in once approved.
              </p>
            </div>
          </motion.div>
        )}

        {/* General Error Message */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-red-50 border border-red-100 flex items-start gap-3"
          >
            <div className="text-red-500 mt-0.5">
              <Lock size={18} />
            </div>
            <p className="text-sm text-red-800 font-medium">
              {errors.general}
            </p>
          </motion.div>
        )}


        {/* Email Input */}
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

        {/* Password Input with Toggle */}
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            Password
          </label>
          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
              <Lock size={20} />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className={`
                w-full px-4 py-3 pl-12 pr-12 rounded-2xl border-2 border-gray-200
                bg-white text-text placeholder-gray-400
                transition-all duration-200
                focus:border-primary-400 focus:ring-2 focus:ring-primary-200
                ${errors.password ? 'border-red-400' : ''}
              `}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-text transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm mt-1"
            >
              {errors.password}
            </motion.p>
          )}
        </div>

        {/* Forgot Password */}
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => navigate('/forgot-password')}
            className="text-sm text-primary-600 font-semibold hover:text-primary-700"
          >
            Forgot Password?
          </button>
        </div>

        {/* Submit Button */}
        <ButtonLoading
          type="submit"
          loading={loading}
          loadingText="Signing in..."
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 px-6 rounded-2xl transition-all duration-200 disabled:opacity-50"
        >
          Sign In
        </ButtonLoading>

        {/* Register Link */}
        <p className="text-center text-sm text-text/60 mt-6">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="text-primary-600 font-semibold hover:text-primary-700"
          >
            Create Account
          </button>
        </p>
      </form>
    </AuthLayout>
  );
};

export default Login;