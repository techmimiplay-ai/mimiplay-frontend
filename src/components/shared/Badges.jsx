import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../utils/api';
import { API_ENDPOINTS } from '../../config';
import { Card, SkeletonLoader } from '../shared';
import { Award, Star, Trophy, Crown } from 'lucide-react';

const Badges = ({ studentStars = 0, showTitle = true }) => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBadges();
  }, []);

  const fetchBadges = async () => {
    try {
      const response = await apiRequest('get', API_ENDPOINTS.CONFIG_BADGES);
      if (response?.status === 'success') {
        setBadges(response.badges || []);
      }
    } catch (error) {
      console.error('Error fetching badges:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'from-gray-100 to-gray-200 border-gray-300 text-gray-700';
      case 'uncommon': return 'from-green-100 to-green-200 border-green-300 text-green-700';
      case 'rare': return 'from-blue-100 to-blue-200 border-blue-300 text-blue-700';
      case 'epic': return 'from-purple-100 to-purple-200 border-purple-300 text-purple-700';
      case 'legendary': return 'from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-700';
      default: return 'from-gray-100 to-gray-200 border-gray-300 text-gray-700';
    }
  };

  const getRarityIcon = (rarity) => {
    switch (rarity) {
      case 'common': return <Award size={16} />;
      case 'uncommon': return <Star size={16} />;
      case 'rare': return <Trophy size={16} />;
      case 'epic': return <Crown size={16} />;
      case 'legendary': return <Crown size={16} className="text-yellow-600" />;
      default: return <Award size={16} />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && <h2 className="text-xl font-bold text-text">🏆 Badges & Achievements</h2>}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <SkeletonLoader key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {showTitle && <h2 className="text-xl font-bold text-text">🏆 Badges & Achievements</h2>}
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {badges.map((badge, index) => {
          const isUnlocked = studentStars >= badge.unlockAt;
          const progress = Math.min((studentStars / badge.unlockAt) * 100, 100);
          
          return (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden transition-all duration-300 ${
                isUnlocked 
                  ? `bg-gradient-to-br ${getRarityColor(badge.rarity)} shadow-lg hover:shadow-xl` 
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}>
                
                {/* Rarity indicator */}
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  {getRarityIcon(badge.rarity)}
                  <span className="text-xs font-semibold capitalize">{badge.rarity}</span>
                </div>

                {/* Badge icon */}
                <div className="text-center mb-3">
                  <div className={`text-4xl mb-2 ${isUnlocked ? '' : 'grayscale'}`}>
                    {badge.icon}
                  </div>
                  <h3 className="font-bold text-sm">{badge.name}</h3>
                </div>

                {/* Description */}
                <p className="text-xs text-center mb-3 opacity-80">
                  {badge.description}
                </p>

                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span>{isUnlocked ? 'Unlocked!' : `${studentStars}/${badge.unlockAt}`}</span>
                    <span className="font-semibold">{Math.round(progress)}%</span>
                  </div>
                  
                  <div className="w-full bg-white/50 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full ${
                        isUnlocked 
                          ? 'bg-gradient-to-r from-green-400 to-green-600' 
                          : 'bg-gradient-to-r from-gray-300 to-gray-400'
                      }`}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>

                {/* Unlock status */}
                {isUnlocked && (
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
          );
        })}
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🎯</div>
          <div>
            <h3 className="font-bold text-blue-900">
              {badges.filter(b => studentStars >= b.unlockAt).length} of {badges.length} badges unlocked
            </h3>
            <p className="text-sm text-blue-700">
              Keep earning stars to unlock more achievements!
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Badges;