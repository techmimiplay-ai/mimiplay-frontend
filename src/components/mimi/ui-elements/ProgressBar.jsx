import React from 'react';
import { motion } from 'framer-motion';

const ProgressBar = ({ 
  current = 1, 
  total = 5, 
  showNumbers = true,
  size = 'md',
  className = ''
}) => {
  const percentage = (current / total) * 100;
  
  const sizes = {
    sm: 'h-2',
    md: 'h-4',
    lg: 'h-6',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <div className={`w-full ${className}`}>
      {showNumbers && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-lg font-semibold text-text">
            Activity {current} of {total}
          </span>
          <span className="text-lg font-bold text-primary-600">
            {Math.round(percentage)}%
          </span>
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClass}`}>
        <motion.div
          className="h-full bg-gradient-to-r from-primary-400 to-secondary-400 rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;