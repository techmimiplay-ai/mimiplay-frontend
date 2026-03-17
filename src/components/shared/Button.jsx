import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  onClick,
  type = 'button',
  ...props 
}) => {
  
  const baseStyles = "font-semibold rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary-400 to-primary-500 text-white hover:from-primary-500 hover:to-primary-600 shadow-lg hover:shadow-xl active:scale-95",
    secondary: "bg-gradient-to-r from-secondary-400 to-secondary-500 text-white hover:from-secondary-500 hover:to-secondary-600 shadow-lg hover:shadow-xl active:scale-95",
    accent: "bg-gradient-to-r from-accent-400 to-accent-500 text-text hover:from-accent-500 hover:to-accent-600 shadow-lg hover:shadow-xl active:scale-95",
    outline: "border-2 border-primary-400 text-primary-600 hover:bg-primary-50 active:scale-95",
    ghost: "text-primary-600 hover:bg-primary-50 active:scale-95",
    success: "bg-success text-white hover:bg-opacity-90 shadow-lg active:scale-95",
  };
  
  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
    xl: "px-10 py-5 text-xl",
  };
  
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <motion.button
      type={type}
      className={`${baseStyles} ${variantClass} ${sizeClass} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...props}
    >
      {loading && <Loader2 className="animate-spin" size={20} />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={20} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={20} />}
    </motion.button>
  );
};

export default Button;