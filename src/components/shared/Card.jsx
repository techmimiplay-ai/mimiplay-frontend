import React from 'react';
import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = false,
  padding = 'md',
  shadow = true,
  onClick,
  ...props 
}) => {
  
  const baseStyles = "bg-white rounded-3xl transition-all duration-200";
  
  const paddings = {
    none: "",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };
  
  const shadowClass = shadow ? "card-shadow" : "";
  const hoverClass = hover ? "hover:card-shadow-hover hover:scale-[1.02] cursor-pointer" : "";
  const paddingClass = paddings[padding] || paddings.md;
  
  const CardComponent = onClick ? motion.div : 'div';
  const motionOptions = onClick ? { whileHover: hover ? { y: -4 } : {} } : {};
  
  return (
    <CardComponent
      className={`${baseStyles} ${paddingClass} ${shadowClass} ${hoverClass} ${className}`}
      onClick={onClick}
      {...motionOptions}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

export default Card;