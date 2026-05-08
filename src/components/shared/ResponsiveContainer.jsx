import React from 'react';
import { motion } from 'framer-motion';

const ResponsiveContainer = ({ 
  children, 
  className = '', 
  tvOptimized = false,
  maxWidth = 'default',
  padding = 'responsive',
  ...props 
}) => {
  
  const maxWidthClasses = {
    default: 'max-w-[1920px]',
    tv: 'max-w-none tv:max-w-[90vw]',
    full: 'max-w-none',
    content: 'max-w-7xl tv:max-w-[80vw]'
  };
  
  const paddingClasses = {
    none: '',
    responsive: 'px-4 md:px-8 tv:px-16 tv-4k:px-24',
    tight: 'px-2 md:px-4 tv:px-8 tv-4k:px-12',
    loose: 'px-6 md:px-12 tv:px-24 tv-4k:px-32'
  };
  
  const tvOptimizedClasses = tvOptimized ? 'tv:text-tv-base tv-4k:text-tv-lg' : '';
  
  return (
    <div 
      className={`
        mx-auto 
        ${maxWidthClasses[maxWidth] || maxWidthClasses.default}
        ${paddingClasses[padding] || paddingClasses.responsive}
        ${tvOptimizedClasses}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default ResponsiveContainer;