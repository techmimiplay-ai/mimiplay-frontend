import React from 'react';
import { User } from 'lucide-react';

const Avatar = ({ 
  src, 
  alt = 'User', 
  size = 'md', 
  className = '',
  online = false,
}) => {
  
  const sizes = {
    xs: 'w-8 h-8',
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <div className={`relative ${sizeClass} ${className}`}>
      {src ? (
        <img
          src={src}
          alt={alt}
          className={`${sizeClass} rounded-full object-cover border-2 border-white shadow-md`}
        />
      ) : (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-primary-400 to-secondary-400 flex items-center justify-center border-2 border-white shadow-md`}>
          <User className="text-white" size={size === 'xs' ? 16 : size === 'sm' ? 20 : 24} />
        </div>
      )}
      
      {online && (
        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      )}
    </div>
  );
};

export default Avatar;