import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // ← ADD THIS
import { AuthLayout } from '../layouts';
import { Button, Input } from '../components/shared';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const ForgotPassword = () => {
  const navigate = useNavigate(); // ← ADD THIS
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Email is required');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Email is invalid');
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setEmailSent(true);
      setLoading(false);
    }, 1500);
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
          
          {/* ↓↓↓ UPDATED: Navigate to login */}
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
        
        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full"
          loading={loading}
        >
          Send Reset Link
        </Button>
        
        {/* ↓↓↓ UPDATED: Navigate to login */}
        <button
          type="button"
          onClick={() => navigate('/login')}
          className="w-full flex items-center justify-center gap-2 text-text/70 hover:text-text transition-colors"
        >
          <ArrowLeft size={18} />
          <span>Back to Sign In</span>
        </button>
      </form>
    </AuthLayout>
  );
};

export default ForgotPassword;