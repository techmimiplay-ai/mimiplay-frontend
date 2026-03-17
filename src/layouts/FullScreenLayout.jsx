import React from 'react';
import { motion } from 'framer-motion';
import { FloatingElements } from '../components/shared';

const FullScreenLayout = ({ 
  children, 
  background = 'default',
  showFloatingElements = true,
  className = ''
}) => {
  
  const backgrounds = {
    default: 'bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50',
    classroom: 'bg-gradient-to-br from-blue-100 via-pink-100 to-purple-100',
    celebration: 'bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-100',
    calm: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-teal-50',
  };
  
  const bgClass = backgrounds[background] || backgrounds.default;
  
  return (
    <div className={`min-h-screen w-screen overflow-hidden relative ${bgClass} ${className}`}>
      
      {/* Floating background elements */}
      {showFloatingElements && <FloatingElements density="high" />}
      
      {/* Main content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 h-screen w-screen"
      >
        {children}
      </motion.div>
    </div>
  );
};

export default FullScreenLayout;