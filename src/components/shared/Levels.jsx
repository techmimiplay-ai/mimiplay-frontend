import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../utils/api';
import { API_ENDPOINTS } from '../../config';
import { Card, SkeletonLoader } from '../shared';
import { TrendingUp, Star } from 'lucide-react';

const Levels = ({ studentStars = 0, showTitle = true }) => {
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await apiRequest('get', API_ENDPOINTS.CONFIG_LEVELS);
      if (response?.status === 'success') {
        setLevels(response.levels || []);
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLevel = () => {
    return levels.find(level => studentStars >= level.min && studentStars <= level.max) || levels[0];
  };

  const getNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const currentIndex = levels.findIndex(l => l.name === currentLevel?.name);
    return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
  };

  const getProgressToNextLevel = () => {
    const currentLevel = getCurrentLevel();
    const nextLevel = getNextLevel();
    
    if (!currentLevel || !nextLevel) return 100;
    
    const progressInCurrentLevel = studentStars - currentLevel.min;
    const totalLevelRange = nextLevel.min - currentLevel.min;
    
    return Math.min((progressInCurrentLevel / totalLevelRange) * 100, 100);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && <h2 className="text-xl font-bold text-text">⭐ Level Progress</h2>}
        <SkeletonLoader className="h-40" />
      </div>
    );
  }

  const currentLevel = getCurrentLevel();
  const nextLevel = getNextLevel();
  const progress = getProgressToNextLevel();
  const starsToNext = nextLevel ? nextLevel.min - studentStars : 0;

  return (
    <div className="space-y-4">
      {showTitle && <h2 className="text-xl font-bold text-text">⭐ Level Progress</h2>}
      
      {/* Current Level Card */}
      <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="text-4xl">{currentLevel?.emoji || '⭐'}</div>
              <div>
                <h3 className="text-2xl font-bold">{currentLevel?.name || 'Getting Started'}</h3>
                <p className="text-white/80">Current Level</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <Star size={16} />
              <span className="font-semibold">{studentStars} stars earned</span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-6xl opacity-20">
              <TrendingUp />
            </div>
          </div>
        </div>
      </Card>

      {/* Progress to Next Level */}
      {nextLevel && (
        <Card>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-text">Next Level: {nextLevel.name}</h3>
                <p className="text-sm text-text/60">
                  {starsToNext} more stars needed {nextLevel.emoji}
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-purple-600">{Math.round(progress)}%</span>
                <p className="text-xs text-text/60">Progress</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-text/60">
                <span>{currentLevel?.min} stars</span>
                <span>{nextLevel?.min} stars</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <motion.div
                  className="h-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* All Levels Overview */}
      <Card>
        <h3 className="font-bold text-text mb-4">All Levels</h3>
        <div className="space-y-3">
          {levels.map((level, index) => {
            const isUnlocked = studentStars >= level.min;
            const isCurrent = currentLevel?.name === level.name;
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  isCurrent 
                    ? 'bg-purple-50 border-purple-300' 
                    : isUnlocked 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                    {level.emoji}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm">{level.name}</h4>
                    <p className="text-xs text-text/60">
                      {level.min} - {level.max === 999999999 ? '∞' : level.max} stars
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  {isCurrent && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-semibold">
                      Current
                    </span>
                  )}
                  {isUnlocked && !isCurrent && (
                    <span className="text-green-600 text-lg">✓</span>
                  )}
                  {!isUnlocked && (
                    <span className="text-gray-400 text-lg">🔒</span>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🚀</div>
          <div>
            <h3 className="font-bold text-yellow-900">Keep Learning!</h3>
            <p className="text-sm text-yellow-800">
              {nextLevel 
                ? `Just ${starsToNext} more stars to reach ${nextLevel.name}!`
                : 'You\'ve reached the highest level! Amazing work! 🎉'
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Levels;