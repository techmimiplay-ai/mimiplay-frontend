import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MimiCharacter from '../MimiCharacter';
import MimiDialogue from '../MimiDialogue';
import { ConfettiAnimation } from '../ui-elements';
import { Trophy, Star, Award } from 'lucide-react';

const CelebrationScreen = ({ 
  totalStars = 23,
  activitiesCompleted = 5,
  studentName = "Friend",
  onContinue
}) => {
  const [showConfetti, setShowConfetti] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Auto continue after 6 seconds
    const timer = setTimeout(() => {
      onContinue && onContinue();
    }, 6000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen">
      
      {/* Confetti */}
      {showConfetti && <ConfettiAnimation duration={5000} density={80} />}
      
      {/* Mimi Character */}
      <MimiCharacter
        expression="celebrating"
        animation="celebrating"
        position="bottom-center"
        size="large"
      />
      
      {/* Main celebration message */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="absolute top-[15%] left-1/2 -translate-x-1/2 text-center"
      >
        <motion.div
          animate={{ rotate: [0, 10, -10, 10, 0] }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="text-9xl mb-4"
        >
          🏆
        </motion.div>
        <h1 className="text-6xl font-bold text-gradient mb-4">
          Amazing Job, {studentName}!
        </h1>
        <p className="text-3xl text-text font-semibold">
          You're a superstar! 🌟
        </p>
      </motion.div>
      
      {/* Stats Cards */}
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 flex gap-8">
        
        {/* Activities Completed */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-3xl shadow-2xl p-8 text-center min-w-[200px]"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, delay: 0.8 }}
          >
            <Award size={64} className="mx-auto mb-4 text-blue-500" />
          </motion.div>
          <p className="text-5xl font-bold text-text mb-2">{activitiesCompleted}</p>
          <p className="text-lg text-text/70">Activities</p>
        </motion.div>
        
        {/* Total Stars */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-3xl shadow-2xl p-8 text-center min-w-[200px]"
        >
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity, delay: 1 }}
          >
            <Star size={64} className="mx-auto mb-4 text-yellow-500 fill-yellow-500" />
          </motion.div>
          <p className="text-5xl font-bold text-text mb-2">{totalStars}</p>
          <p className="text-lg text-text/70">Stars Earned</p>
        </motion.div>
      </div>
      
      {/* Floating badges */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-6xl"
          style={{
            left: `${15 + i * 12}%`,
            top: `${25 + (i % 3) * 15}%`
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1.5, 0],
            y: [0, -100],
            rotate: 360
          }}
          transition={{
            duration: 3,
            delay: 1 + i * 0.2,
            repeat: Infinity,
            repeatDelay: 2
          }}
        >
          {['🎯', '💯', '🔥', '💪', '👏', '🎨'][i]}
        </motion.div>
      ))}
    </div>
  );
};

export default CelebrationScreen;