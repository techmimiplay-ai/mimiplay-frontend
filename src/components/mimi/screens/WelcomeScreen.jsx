import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MimiCharacter from '../MimiCharacter';
import MimiDialogue from '../MimiDialogue';
import { ConfettiAnimation } from '../ui-elements';

const WelcomeScreen = ({ studentName = "Friend", onComplete }) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentMessage, setCurrentMessage] = useState(0);

  const messages = [
    `Yay! Hi ${studentName}! 🎉`,
    `I'm so happy to see you today! 😊`,
    `Ready to learn something awesome? 🌟`
  ];

  useEffect(() => {
    setShowConfetti(true);
    
    // Change messages every 2.5 seconds
    const messageInterval = setInterval(() => {
      setCurrentMessage(prev => {
        if (prev < messages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(messageInterval);
          // Auto proceed to next screen after welcome
          setTimeout(() => {
            onComplete && onComplete();
          }, 2000);
          return prev;
        }
      });
    }, 2500);

    // Stop confetti after 3 seconds
    const confettiTimer = setTimeout(() => {
      setShowConfetti(false);
    }, 3000);

    return () => {
      clearInterval(messageInterval);
      clearTimeout(confettiTimer);
    };
  }, []);

  return (
    <div className="relative w-full h-screen">
      
      {/* Confetti */}
      {showConfetti && <ConfettiAnimation duration={3000} density={60} />}
      
      {/* Mimi Character - celebrating */}
      <MimiCharacter
        expression="excited"
        animation="celebrating"
        position="center"
        size="large"
      />
      
      {/* Welcome Message */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentMessage}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            <MimiDialogue
              text={messages[currentMessage]}
              position="bottom"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      
      {/* Student name with animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", delay: 0.3 }}
        className="absolute bottom-[25%] left-1/2 -translate-x-1/2"
      >
        <div className="bg-white rounded-3xl shadow-2xl px-12 py-6">
          <p className="text-5xl font-bold text-gradient">
            ✨ {studentName} ✨
          </p>
        </div>
      </motion.div>
      
      {/* Decorative stars */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-5xl"
          style={{
            left: `${15 + i * 10}%`,
            top: `${30 + (i % 2) * 20}%`,
          }}
          initial={{ opacity: 0, scale: 0, rotate: 0 }}
          animate={{ 
            opacity: [0, 1, 1, 0],
            scale: [0, 1.5, 1.5, 0],
            rotate: 360 
          }}
          transition={{
            duration: 2,
            delay: i * 0.2,
            repeat: Infinity,
            repeatDelay: 3
          }}
        >
          {i % 2 === 0 ? '⭐' : '✨'}
        </motion.div>
      ))}
    </div>
  );
};

export default WelcomeScreen;