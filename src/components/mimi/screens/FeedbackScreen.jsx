import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import MimiCharacter from '../MimiCharacter';
import MimiDialogue from '../MimiDialogue';
import { StarRating, ConfettiAnimation } from '../ui-elements';

const FeedbackScreen = ({ 
  isCorrect = true,
  stars = 5,
  feedback = "Wonderful! You said it perfectly!",
  onContinue
}) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (isCorrect) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isCorrect]);

  useEffect(() => {
    // Auto continue after 4 seconds
    const timer = setTimeout(() => {
      onContinue && onContinue();
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="relative w-full h-screen">
      
      {/* Confetti for correct answers */}
      {showConfetti && <ConfettiAnimation density={70} />}
      
      {/* Mimi Character */}
      <MimiCharacter
        expression={isCorrect ? 'celebrating' : 'encouraging'}
        animation={isCorrect ? 'jumping' : 'talking'}
        position="center"
        size="large"
      />
      
      {/* Feedback Message */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
        <MimiDialogue
          text={feedback}
          position="bottom"
        />
      </div>
      
      {/* Stars */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, type: "spring" }}
        className="absolute bottom-[20%] left-1/2 -translate-x-1/2"
      >
        <StarRating rating={stars} size="xl" animated={true} />
      </motion.div>
      
      {/* Success message */}
      {isCorrect && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-4xl font-bold text-gradient">
            Keep it up! 🎉
          </p>
        </motion.div>
      )}
      
      {/* Try again message */}
      {!isCorrect && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="absolute bottom-[10%] left-1/2 -translate-x-1/2 text-center"
        >
          <p className="text-3xl font-semibold text-text">
            Let's try again together! 💪
          </p>
        </motion.div>
      )}
      
      {/* Floating emojis for correct answers */}
      {isCorrect && (
        <>
          {['🎉', '⭐', '🌟', '✨', '💫'].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-6xl"
              style={{
                left: `${20 + i * 15}%`,
                top: '50%'
              }}
              animate={{
                y: [-50, -150],
                opacity: [0, 1, 0],
                scale: [0.5, 1.5, 0.5],
                rotate: [0, 360]
              }}
              transition={{
                duration: 2,
                delay: 0.5 + i * 0.2,
                repeat: 1
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
};

export default FeedbackScreen;