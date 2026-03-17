import React from 'react';
import { motion } from 'framer-motion';
import { FloatingElements } from '../components/shared';

const AuthLayout = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Floating background elements */}
      <FloatingElements density="normal" />
      
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", duration: 0.6, delay: 0.2 }}
          >
            <h1 className="text-5xl font-display font-bold text-gradient mb-2">
              Alexi
            </h1>
            <p className="text-lg text-text/70">Smart Learning Platform</p>
          </motion.div>
        </div>
        
        {/* Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="bg-white rounded-3xl shadow-2xl p-8"
        >
          {title && (
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-text mb-2">{title}</h2>
              {subtitle && (
                <p className="text-text/60">{subtitle}</p>
              )}
            </div>
          )}
          
          {children}
        </motion.div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-6"
        >
          <p className="text-sm text-text/50">
            © 2026 Alexi Learning Platform. All rights reserved.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default AuthLayout;