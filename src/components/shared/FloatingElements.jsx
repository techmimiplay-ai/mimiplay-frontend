import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const FloatingElements = ({ density = 'normal' }) => {
  
  const counts = {
    low: 5,
    normal: 10,
    high: 15,
  };
  
  const count = counts[density] || counts.normal;

  const elements = useMemo(() => Array.from({ length: count }, (_, i) => ({
    id: i,
    size: Math.random() * 40 + 20,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 10 + 15,
    delay: Math.random() * 5,
    shape: ['circle', 'star', 'cloud'][Math.floor(Math.random() * 3)],
  })), [count]);
  
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {elements.map((el) => (
        <motion.div
          key={el.id}
          className="absolute"
          style={{
            left: `${el.x}%`,
            top: `${el.y}%`,
            width: el.size,
            height: el.size,
          }}
          animate={{
            y: [0, -30, 0],
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: el.duration,
            repeat: Infinity,
            delay: el.delay,
            ease: 'easeInOut',
          }}
        >
          {el.shape === 'circle' && (
            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-200 to-secondary-200 opacity-20" />
          )}
          {el.shape === 'star' && (
            <div className="w-full h-full text-accent-300 opacity-30 text-4xl">⭐</div>
          )}
          {el.shape === 'cloud' && (
            <div className="w-full h-full text-primary-200 opacity-20 text-4xl">☁️</div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default FloatingElements;