import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../../utils/api';
import { API_ENDPOINTS } from '../../../config';
import { Card, SkeletonLoader, Badges } from '../../../components/shared';
import { Trophy, Star, Award, Target } from 'lucide-react';

const AchievementsTab = ({ selectedChild }) => {
  const [starsData, setStarsData] = useState({
    total_stars: 0,
    today_stars: 0,
    today_count: 0,
    results: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedChild?.id) {
      fetchStarsData(selectedChild.id);
    }
  }, [selectedChild?.id]);

  const fetchStarsData = async (studentId) => {
    try {
      const res = await apiRequest('get', API_ENDPOINTS.PARENT_CHILD_STARS(studentId));
      if (res?.status === 'success') {
        setStarsData(res);
      }
    } catch (err) {
      console.error('Stars fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!selectedChild) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="text-5xl mb-3">🏆</div>
          <p className="text-text/60 font-semibold">No child selected</p>
          <p className="text-sm text-text/40 mt-1">Please select a child to view achievements</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-40" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonLoader key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const totalStars = starsData.total_stars;
  const totalActivities = starsData.results.length;
  const averageScore = totalActivities > 0 
    ? (starsData.results.reduce((sum, r) => sum + r.stars, 0) / totalActivities).toFixed(1)
    : '0.0';

  // Calculate streaks and milestones
  const getStreak = () => {
    if (starsData.results.length === 0) return 0;
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasActivity = starsData.results.some(r => r.date === dateStr);
      if (hasActivity) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  };

  const streak = getStreak();

  // Achievement milestones
  const achievements = [
    {
      title: 'First Steps',
      description: 'Complete your first activity',
      icon: '👶',
      unlocked: totalActivities >= 1,
      progress: Math.min(totalActivities, 1),
      target: 1,
      color: 'from-green-100 to-green-200 border-green-300'
    },
    {
      title: 'Star Collector',
      description: 'Earn 10 stars',
      icon: '⭐',
      unlocked: totalStars >= 10,
      progress: Math.min(totalStars, 10),
      target: 10,
      color: 'from-yellow-100 to-yellow-200 border-yellow-300'
    },
    {
      title: 'Learning Streak',
      description: 'Learn for 3 days in a row',
      icon: '🔥',
      unlocked: streak >= 3,
      progress: Math.min(streak, 3),
      target: 3,
      color: 'from-orange-100 to-orange-200 border-orange-300'
    },
    {
      title: 'Activity Master',
      description: 'Complete 20 activities',
      icon: '🎯',
      unlocked: totalActivities >= 20,
      progress: Math.min(totalActivities, 20),
      target: 20,
      color: 'from-blue-100 to-blue-200 border-blue-300'
    },
    {
      title: 'Star Champion',
      description: 'Earn 50 stars',
      icon: '🏆',
      unlocked: totalStars >= 50,
      progress: Math.min(totalStars, 50),
      target: 50,
      color: 'from-purple-100 to-purple-200 border-purple-300'
    },
    {
      title: 'Perfect Performer',
      description: 'Maintain 4.5+ average score',
      icon: '💯',
      unlocked: parseFloat(averageScore) >= 4.5 && totalActivities >= 5,
      progress: Math.min(parseFloat(averageScore), 4.5),
      target: 4.5,
      color: 'from-pink-100 to-pink-200 border-pink-300'
    },
    {
      title: 'Dedication Award',
      description: 'Learn for 7 days straight',
      icon: '🎖️',
      unlocked: streak >= 7,
      progress: Math.min(streak, 7),
      target: 7,
      color: 'from-indigo-100 to-indigo-200 border-indigo-300'
    },
    {
      title: 'Learning Legend',
      description: 'Earn 100 stars',
      icon: '👑',
      unlocked: totalStars >= 100,
      progress: Math.min(totalStars, 100),
      target: 100,
      color: 'from-yellow-200 to-yellow-300 border-yellow-400'
    }
  ];

  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">
          🏆 {selectedChild.name}'s Achievements
        </h1>
        <p className="text-text/60">Celebrate learning milestones and accomplishments</p>
      </div>

      {/* Achievement Summary */}
      <Card className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Achievement Progress</h2>
            <p className="text-white/90 mb-4">
              {unlockedCount} of {achievements.length} achievements unlocked
            </p>
            <div className="flex items-center gap-4 text-white/90">
              <div className="flex items-center gap-1">
                <Star size={16} />
                <span>{totalStars} stars earned</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy size={16} />
                <span>{totalActivities} activities completed</span>
              </div>
              <div className="flex items-center gap-1">
                <Award size={16} />
                <span>{streak} day streak</span>
              </div>
            </div>
          </div>
          <div className="text-6xl opacity-20">
            <Trophy />
          </div>
        </div>
      </Card>

      {/* Custom Achievements */}
      <div>
        <h2 className="text-xl font-bold text-text mb-4">🎯 Learning Milestones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {achievements.map((achievement, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden transition-all duration-300 ${
                achievement.unlocked 
                  ? `bg-gradient-to-br ${achievement.color} shadow-lg hover:shadow-xl` 
                  : 'bg-gray-50 border-gray-200 opacity-70'
              }`}>
                
                {/* Achievement Icon */}
                <div className="text-center mb-3">
                  <div className={`text-4xl mb-2 ${achievement.unlocked ? '' : 'grayscale'}`}>
                    {achievement.icon}
                  </div>
                  <h3 className="font-bold text-sm">{achievement.title}</h3>
                </div>

                {/* Description */}
                <p className="text-xs text-center mb-3 opacity-80">
                  {achievement.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>
                      {achievement.unlocked ? 'Completed!' : `${achievement.progress}/${achievement.target}`}
                    </span>
                    <span className="font-semibold">
                      {Math.round((achievement.progress / achievement.target) * 100)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        achievement.unlocked 
                          ? 'bg-gradient-to-r from-green-400 to-green-600' 
                          : 'bg-gradient-to-r from-gray-300 to-gray-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((achievement.progress / achievement.target) * 100, 100)}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Unlock Badge */}
                {achievement.unlocked && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-white text-xs">✓</span>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Badges System */}
      <Badges studentStars={totalStars} showTitle={true} />

      {/* Next Goals */}
      <Card>
        <h3 className="font-bold text-text mb-4 flex items-center gap-2">
          <Target size={20} />
          Next Goals
        </h3>
        <div className="space-y-3">
          {achievements
            .filter(a => !a.unlocked)
            .slice(0, 3)
            .map((achievement, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <h4 className="font-semibold text-sm">{achievement.title}</h4>
                    <p className="text-xs text-text/60">{achievement.description}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-blue-700">
                    {achievement.target - achievement.progress} more to go!
                  </p>
                  <p className="text-xs text-blue-600">
                    {Math.round((achievement.progress / achievement.target) * 100)}% complete
                  </p>
                </div>
              </motion.div>
            ))}
        </div>
      </Card>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🌟</div>
          <div>
            <h3 className="font-bold text-purple-900">Amazing Progress!</h3>
            <p className="text-sm text-purple-800">
              {unlockedCount === 0 
                ? `${selectedChild.name} is just getting started! The first achievement is within reach! 🎯`
                : unlockedCount < 4 
                ? `${selectedChild.name} has unlocked ${unlockedCount} achievements! Keep learning to unlock more! 🚀`
                : unlockedCount < 7 
                ? `Wow! ${selectedChild.name} is an achievement champion with ${unlockedCount} unlocked! 🏆`
                : `Incredible! ${selectedChild.name} has unlocked ${unlockedCount} achievements! A true learning superstar! 👑`
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AchievementsTab;