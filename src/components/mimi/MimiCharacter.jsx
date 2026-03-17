import React from 'react';
import { motion } from 'framer-motion';

const MimiCharacter = ({ 
  expression = 'happy',
  animation = 'idle',
  position = 'center',
  size = 'large',
  className = ''
}) => {
  
  // Position classes
  const positions = {
    center: 'left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2',
    left: 'left-[10%] top-1/2 -translate-y-1/2',
    right: 'right-[10%] top-1/2 -translate-y-1/2',
    'top-left': 'left-[5%] top-[10%]',
    'top-right': 'right-[5%] top-[10%]',
    'bottom-center': 'left-1/2 bottom-[5%] -translate-x-1/2',
  };
  
  // Size classes - UPDATED FOR FULL SCREEN
  const sizes = {
    small: 'w-64 h-64',
    medium: 'w-96 h-96',
    large: 'w-screen h-screen', // ← CHANGED THIS
    'extra-large': 'w-[600px] h-[600px]',
    full: 'w-screen h-screen',
  };
  
  // Animation variants
  const animations = {
    idle: {
      y: [0, -10, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    talking: {
      scale: [1, 1.02, 1, 1.02, 1],
      transition: {
        duration: 0.8,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    jumping: {
      y: [0, -50, 0],
      transition: {
        duration: 0.6,
        repeat: 2,
        ease: "easeOut"
      }
    },
    celebrating: {
      rotate: [0, -10, 10, -10, 10, 0],
      scale: [1, 1.1, 1, 1.1, 1],
      transition: {
        duration: 1,
        repeat: 2,
        ease: "easeInOut"
      }
    },
    waving: {
      rotate: [0, 15, -15, 15, -15, 0],
      transition: {
        duration: 1,
        repeat: 3,
        ease: "easeInOut"
      }
    },
    thinking: {
      rotate: [0, -5, 5, -5, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
  };
  
  const positionClass = positions[position] || positions.center;
  const sizeClass = sizes[size] || sizes.large;
  
  return (
    <motion.div
      className={`absolute ${positionClass} ${sizeClass} ${className}`}
      animate={animations[animation]}
      style={{ zIndex: 20 }}
    >
      {/* Mimi Character Image - UPDATED */}
      <div className="relative w-full h-full">
        <img
          src="/Alexi_main.jpg"
          alt="Mimi"
          className="w-full h-full object-contain" // ← CHANGED: removed drop-shadow for clean look
        />
        
        {/* Expression overlay effects */}
        {expression === 'excited' && (
          <motion.div
            className="absolute -top-10 -right-10 text-6xl"
            animate={{
              scale: [0, 1.2, 1],
              rotate: [0, 360],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              repeatDelay: 2
            }}
          >
            ⭐
          </motion.div>
        )}
        
        {expression === 'celebrating' && (
          <>
            <motion.div
              className="absolute -top-5 left-1/4 text-5xl"
              animate={{ y: [-20, 20], opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              🎉
            </motion.div>
            <motion.div
              className="absolute -top-5 right-1/4 text-5xl"
              animate={{ y: [-20, 20], opacity: [1, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
            >
              ✨
            </motion.div>
          </>
        )}
        
        {expression === 'thinking' && (
          <motion.div
            className="absolute -top-10 right-10 text-5xl"
            animate={{
              y: [0, -10, 0],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            💭
          </motion.div>
        )}
        
        {expression === 'sad' && (
          <motion.div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 text-4xl"
            animate={{
              y: [0, 10],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          >
            💧
          </motion.div>
        )}
      </div>
      
      {/* Character shadow - REMOVED for full screen */}
    </motion.div>
  );
};

export default MimiCharacter;