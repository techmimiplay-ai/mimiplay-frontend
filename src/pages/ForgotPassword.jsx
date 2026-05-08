import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINTS } from '../config';
import { AuthLayout } from '../layouts';
import { Button, Input, ButtonLoading, FormLoading } from '../components/shared';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { handleError } from '../utils/errorHandler';
import { showToast, apiToast } from '../utils/toast';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      showToast.warning('Please enter your email address');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      showToast.warning('Please enter a valid email address');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      await apiToast.operation(
        () => axios.post(API_ENDPOINTS.FORGOT_PASSWORD, { email }),
        {
          loading: 'Sending reset link...',
          success: 'Password reset link sent successfully!',
          error: 'Failed to send reset email. Please try again.'
        }
      );
      
      setEmailSent(true);
      
    } catch (err) {
      console.error('Forgot password error:', err);
      // Error already handled by apiToast
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <AuthLayout>
        <div className="text-center py-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6 }}
            className="inline-block mb-6"
          >
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle size={48} className="text-green-600" />
            </div>
          </motion.div>
          
          <h2 className="text-3xl font-bold text-text mb-3">
            Check Your Email! 📧
          </h2>
          <p className="text-text/70 mb-6">
            We've sent a password reset link to<br />
            <span className="font-semibold text-text">{email}</span>
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-6">
            <p className="text-sm text-blue-800 text-left">
              💡 <strong>Didn't receive the email?</strong><br />
              Check your spam folder or{' '}
              <button
                onClick={() => setEmailSent(false)}
                className="text-primary-600 font-semibold underline"
              >
                try again
              </button>
            </p>
          </div>
          
          {/* Back to login button */}
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            icon={ArrowLeft}
            onClick={() => navigate('/login')}
          >
            Back to Sign In
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot Password?"
      subtitle="No worries! We'll send you reset instructions"
    >
      <FormLoading loading={loading}>
        <form onSubmit={handleSubmit} className="space-y-5">
          
          <Input
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            icon={Mail}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError('');
            }}
            error={error}
          />
          
          <ButtonLoading
            type="submit"
            loading={loading}
            className="w-full"
          >
            Send Reset Link
          </ButtonLoading>
        
        {/* Back to login button */}
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

export default ForgotPassword;