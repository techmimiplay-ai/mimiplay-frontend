import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const MimiDialogue = ({ 
  text, 
  position = 'top',
  autoHide = false,
  duration = 3000,
  className = ''
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide && text) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [text, autoHide, duration]);

  const positions = {
    top: 'top-0 left-1/2 -translate-x-1/2 -translate-y-full mb-8',
    bottom: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-full mt-8',
    left: 'left-0 top-1/2 -translate-y-1/2 -translate-x-full mr-8',
    right: 'right-0 top-1/2 -translate-y-1/2 translate-x-full ml-8',
  };

  const positionClass = positions[position] || positions.top;

  return (
    <AnimatePresence>
      {isVisible && text && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          className={`absolute ${positionClass} ${className}`}
          style={{ zIndex: 30 }}
        >
          {/* Speech Bubble */}
          <div className="relative bg-white rounded-3xl shadow-2xl px-8 py-6 max-w-2xl">
            {/* Bubble tail based on position */}
            {position === 'top' && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[20px] border-t-white" />
              </div>
            )}
            {position === 'bottom' && (
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-full">
                <div className="w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-b-[20px] border-b-white" />
              </div>
            )}
            {position === 'left' && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full">
                <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-l-[20px] border-l-white" />
              </div>
            )}
            {position === 'right' && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full">
                <div className="w-0 h-0 border-t-[20px] border-t-transparent border-b-[20px] border-b-transparent border-r-[20px] border-r-white" />
              </div>
            )}
            
            {/* Text with typing animation */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-2xl md:text-3xl font-semibold text-text text-center leading-relaxed"
            >
              {text}
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MimiDialogue;