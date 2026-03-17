import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import MimiCharacter from '../MimiCharacter';
import MimiDialogue from '../MimiDialogue';
import { ListeningIndicator, ProgressBar } from '../ui-elements';

const ActivityScreen = ({ 
  activityData = {
    prompt: "Can you say 'Apple' for me?",
    itemImage: null,
    letter: "A",
    itemName: "Apple"
  },
  currentActivity = 1,
  totalActivities = 5,
  isListening = false,
  onResponse
}) => {
  const [mimiState, setMimiState] = useState({
    expression: 'happy',
    animation: 'talking'
  });

  return (
    <div className="relative w-full h-screen">
      
      {/* Progress Bar */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4 z-30">
        <ProgressBar 
          current={currentActivity} 
          total={totalActivities}
          size="lg"
        />
      </div>
      
      {/* Mimi Character - positioned left */}
      <div className="absolute left-[10%] top-1/2 -translate-y-1/2 z-20">
        <MimiCharacter
          expression={mimiState.expression}
          animation={mimiState.animation}
          position="center"
          size="medium"
        />
        
        {/* Mimi's question */}
        <div className="absolute top-0 left-full ml-8 w-96">
          <MimiDialogue
            text={activityData.prompt}
            position="left"
          />
        </div>
      </div>
      
      {/* Content Area - Right side */}
      <div className="absolute right-[15%] top-1/2 -translate-y-1/2 flex flex-col items-center gap-8">
        
        {/* Item Image */}
        {activityData.itemImage && (
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8 }}
            className="w-80 h-80 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-8"
          >
            <img 
              src={activityData.itemImage} 
              alt={activityData.itemName}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><circle cx="100" cy="100" r="80" fill="%23ff6b9d"/><text x="100" y="120" font-size="80" text-anchor="middle" fill="white">🍎</text></svg>';
              }}
            />
          </motion.div>
        )}
        
        {/* Letter Display */}
        {activityData.letter && (
          <motion.div
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", duration: 0.8, delay: 0.2 }}
            className="text-[180px] font-black bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-transparent"
          >
            {activityData.letter}
          </motion.div>
        )}
        
        {/* Item Name */}
        {activityData.itemName && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-6xl font-bold text-purple-600"
          >
            {activityData.itemName}
          </motion.div>
        )}
      </div>
      
      {/* Listening Indicator */}
      <AnimatePresence>
        {isListening && <ListeningIndicator />}
      </AnimatePresence>
      
      {/* Decorative sparkles */}
      <motion.div
        className="absolute top-[20%] right-[10%] text-6xl"
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity 
        }}
      >
        ✨
      </motion.div>
    </div>
  );
};

export default ActivityScreen;