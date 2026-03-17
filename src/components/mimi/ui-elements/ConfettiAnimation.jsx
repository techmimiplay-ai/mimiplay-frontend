import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const ConfettiAnimation = ({ duration = 3000, density = 50 }) => {
  const [confetti, setConfetti] = useState([]);

  useEffect(() => {
    const pieces = Array.from({ length: density }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      color: ['#ff6b9d', '#4ecdc4', '#ffe66d', '#95e1d3', '#ffa3bb'][Math.floor(Math.random() * 5)],
      delay: Math.random() * 0.5,
      duration: 2 + Math.random() * 2,
    }));
    
    setConfetti(pieces);
    
    const timer = setTimeout(() => {
      setConfetti([]);
    }, duration);
    
    return () => clearTimeout(timer);
  }, [duration, density]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {confetti.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute -top-10"
          style={{
            left: `${piece.x}%`,
            width: '10px',
            height: '10px',
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0%',
          }}
          initial={{ y: -20, opacity: 1, rotate: 0 }}
          animate={{
            y: window.innerHeight + 20,
            opacity: [1, 1, 0],
            rotate: 360 * (Math.random() > 0.5 ? 1 : -1) * (2 + Math.random() * 3),
            x: (Math.random() - 0.5) * 100,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: "easeIn"
          }}
        />
      ))}
    </div>
  );
};

export default ConfettiAnimation;