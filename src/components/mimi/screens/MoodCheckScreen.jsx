import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import MimiCharacter from '../MimiCharacter';
import MimiDialogue from '../MimiDialogue';

const MoodCheckScreen = ({ studentName = "Friend", onContinue }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      dialogue: `Aww, ${studentName}... you seem a little sad today 💙`,
      expression: 'sad',
      animation: 'idle'
    },
    {
      dialogue: "That's okay! Everyone feels sad sometimes 🤗",
      expression: 'encouraging',
      animation: 'talking'
    },
    {
      dialogue: "How about we play a fun game to make you smile? 😊",
      expression: 'happy',
      animation: 'waving'
    }
  ];

  useEffect(() => {
    if (currentStep < steps.length - 1) {
      const timer = setTimeout(() => {
        setCurrentStep(prev => prev + 1);
      }, 3000);
      return () => clearTimeout(timer);
    } else {
      // Auto continue after last message
      const finalTimer = setTimeout(() => {
        onContinue && onContinue();
      }, 2500);
      return () => clearTimeout(finalTimer);
    }
  }, [currentStep]);

  const currentStepData = steps[currentStep];

  return (
    <div className="relative w-full h-screen">
      
      {/* Mimi Character */}
      <MimiCharacter
        expression={currentStepData.expression}
        animation={currentStepData.animation}
        position="center"
        size="large"
      />
      
      {/* Dialogue */}
      <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-full max-w-3xl px-4">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <MimiDialogue
            text={currentStepData.dialogue}
            position="bottom"
          />
        </motion.div>
      </div>
      
      {/* Rainbow animation */}
      {currentStep >= 1 && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-[20%] left-1/2 -translate-x-1/2"
        >
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-9xl"
          >
            🌈
          </motion.div>
        </motion.div>
      )}
      
      {/* Hearts floating up */}
      {currentStep >= 2 && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-5xl"
              style={{ left: `${30 + i * 10}%`, bottom: '10%' }}
              animate={{
                y: [0, -300],
                opacity: [0, 1, 1, 0],
                rotate: [0, 360],
              }}
              transition={{
                duration: 3,
                delay: i * 0.3,
                repeat: Infinity,
              }}
            >
              💝
            </motion.div>
          ))}
        </>
      )}
    </div>
  );
};

export default MoodCheckScreen;