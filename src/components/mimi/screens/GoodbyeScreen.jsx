import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import MimiCharacter from '../MimiCharacter';
import MimiDialogue from '../MimiDialogue';
import { Star } from 'lucide-react';

const GoodbyeScreen = ({ 
  studentName = "Friend",
  totalStars = 23,
  onComplete
}) => {

  useEffect(() => {
    // Auto complete after 5 seconds
    const timer = setTimeout(() => {
      onComplete && onComplete();
    }, 5000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen">
      
      {/* Mimi Character - waving */}
      <MimiCharacter
        expression="happy"
        animation="waving"
        position="center"
        size="large"
      />
      
      {/* Goodbye Message */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
        <MimiDialogue
          text={`Great job today, ${studentName}! 🎉`}
          position="bottom"
        />
      </div>
      
      {/* Stars Earned */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute bottom-[30%] left-1/2 -translate-x-1/2"
      >
        <div className="bg-white rounded-3xl shadow-2xl px-12 py-8 text-center">
          <p className="text-2xl text-text/70 mb-2">You earned</p>
          <div className="flex items-center justify-center gap-4 mb-2">
            {[...Array(5)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0, rotate: -180 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{
                  delay: 0.8 + i * 0.1,
                  type: "spring"
                }}
              >
                <Star size={48} className="fill-yellow-400 text-yellow-400" />
              </motion.div>
            ))}
          </div>
          <p className="text-5xl font-bold text-gradient">{totalStars} Stars!</p>
        </div>
      </motion.div>
      
      {/* See you message */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        className="absolute bottom-[15%] left-1/2 -translate-x-1/2 text-center"
      >
        <p className="text-4xl font-bold text-text mb-2">
          See you tomorrow! 👋
        </p>
        <p className="text-2xl text-text/60">
          Keep being awesome!
        </p>
      </motion.div>
      
      {/* Floating hearts */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-5xl"
          style={{
            left: `${10 + i * 10}%`,
            bottom: '0%'
          }}
          animate={{
            y: [0, -400],
            opacity: [0, 1, 1, 0],
            rotate: [0, 360],
            scale: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 4,
            delay: i * 0.3,
            repeat: Infinity,
            repeatDelay: 1
          }}
        >
          {i % 2 === 0 ? '💖' : '💝'}
        </motion.div>
      ))}
      
      {/* Sun rising animation */}
      <motion.div
        className="absolute top-10 right-20 text-8xl"
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: { duration: 20, repeat: Infinity, ease: "linear" },
          scale: { duration: 2, repeat: Infinity }
        }}
      >
        ☀️
      </motion.div>
    </div>
  );
};

export default GoodbyeScreen;