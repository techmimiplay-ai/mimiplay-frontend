import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../utils/api';
import { API_ENDPOINTS } from '../../config';
import { Card, SkeletonLoader } from '../shared';
import { BookOpen, Lock, CheckCircle } from 'lucide-react';

const Skills = ({ studentStars = 0, showTitle = true }) => {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await apiRequest('get', API_ENDPOINTS.CONFIG_SKILLS);
      if (response?.status === 'success') {
        setSkills(response.skills || []);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSkillIcon = (skillName) => {
    const icons = {
      'Alphabets': '🔤',
      'Common Fruits': '🍎',
      'Colors': '🌈',
      'Animals': '🐾',
      'Numbers': '🔢',
      'Phonics': '🗣️',
      'Shapes': '🔺',
      'Weather': '🌤️',
      'Family': '👨‍👩‍👧‍👦',
      'Body Parts': '👤'
    };
    return icons[skillName] || '📚';
  };

  const getColorClass = (color) => {
    const colorMap = {
      'green': 'from-green-100 to-green-200 border-green-300 text-green-700',
      'blue': 'from-blue-100 to-blue-200 border-blue-300 text-blue-700',
      'purple': 'from-purple-100 to-purple-200 border-purple-300 text-purple-700',
      'orange': 'from-orange-100 to-orange-200 border-orange-300 text-orange-700',
      'pink': 'from-pink-100 to-pink-200 border-pink-300 text-pink-700',
      'red': 'from-red-100 to-red-200 border-red-300 text-red-700',
      'yellow': 'from-yellow-100 to-yellow-200 border-yellow-300 text-yellow-700'
    };
    return colorMap[color] || 'from-gray-100 to-gray-200 border-gray-300 text-gray-700';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && <h2 className="text-xl font-bold text-text">📚 Learning Skills</h2>}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonLoader key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const unlockedSkills = skills.filter(skill => studentStars >= skill.unlocksAt);
  const nextSkill = skills.find(skill => studentStars < skill.unlocksAt);

  return (
    <div className="space-y-4">
      {showTitle && <h2 className="text-xl font-bold text-text">📚 Learning Skills</h2>}
      
      {/* Skills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, index) => {
          const isUnlocked = studentStars >= skill.unlocksAt;
          const progress = skill.unlocksAt > 0 ? Math.min((studentStars / skill.unlocksAt) * 100, 100) : 100;
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className={`relative overflow-hidden transition-all duration-300 ${
                isUnlocked 
                  ? `bg-gradient-to-br ${getColorClass(skill.color)} shadow-lg hover:shadow-xl` 
                  : 'bg-gray-50 border-gray-200 opacity-60'
              }`}>
                
                {/* Skill Icon and Name */}
                <div className="flex items-center gap-3 mb-3">
                  <div className={`text-3xl ${isUnlocked ? '' : 'grayscale'}`}>
                    {getSkillIcon(skill.name)}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-sm">{skill.name}</h3>
                    <p className="text-xs opacity-80">
                      {isUnlocked ? 'Unlocked!' : `Unlocks at ${skill.unlocksAt} stars`}
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    {isUnlocked ? (
                      <CheckCircle size={20} className="text-green-600" />
                    ) : (
                      <Lock size={20} className="text-gray-400" />
                    )}
                  </div>
                </div>

                {/* Progress Bar */}
                {!isUnlocked && skill.unlocksAt > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span>{studentStars}/{skill.unlocksAt} stars</span>
                      <span className="font-semibold">{Math.round(progress)}%</span>
                    </div>
                    
                    <div className="w-full bg-white/50 rounded-full h-2">
                      <motion.div
                        className="h-2 bg-gradient-to-r from-gray-300 to-gray-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, delay: index * 0.1 }}
                      />
                    </div>
                  </div>
                )}

                {/* Unlock Badge */}
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

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Unlocked Skills Summary */}
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎓</div>
            <div>
              <h3 className="font-bold text-green-900">
                {unlockedSkills.length} of {skills.length} Skills Unlocked
              </h3>
              <p className="text-sm text-green-700">
                Great progress! Keep learning to unlock more skills.
              </p>
            </div>
          </div>
        </Card>

        {/* Next Skill */}
        {nextSkill && (
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <div className="flex items-center gap-4">
              <div className="text-4xl">{getSkillIcon(nextSkill.name)}</div>
              <div>
                <h3 className="font-bold text-blue-900">
                  Next: {nextSkill.name}
                </h3>
                <p className="text-sm text-blue-700">
                  {nextSkill.unlocksAt - studentStars} more stars to unlock!
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Learning Path */}
      <Card>
        <h3 className="font-bold text-text mb-4 flex items-center gap-2">
          <BookOpen size={20} />
          Learning Path
        </h3>
        <div className="space-y-3">
          {skills.map((skill, index) => {
            const isUnlocked = studentStars >= skill.unlocksAt;
            const isCurrent = !isUnlocked && (!nextSkill || skill.name === nextSkill.name);
            
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center gap-3 p-3 rounded-lg border-l-4 ${
                  isUnlocked 
                    ? 'bg-green-50 border-green-400' 
                    : isCurrent 
                    ? 'bg-blue-50 border-blue-400' 
                    : 'bg-gray-50 border-gray-300'
                }`}
              >
                <div className={`text-2xl ${isUnlocked ? '' : 'grayscale'}`}>
                  {getSkillIcon(skill.name)}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{skill.name}</h4>
                  <p className="text-xs text-text/60">
                    {skill.unlocksAt === 0 ? 'Available from start' : `Unlocks at ${skill.unlocksAt} stars`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {isUnlocked && (
                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                      Unlocked
                    </span>
                  )}
                  {isCurrent && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-semibold">
                      Next Goal
                    </span>
                  )}
                  {!isUnlocked && !isCurrent && (
                    <Lock size={16} className="text-gray-400" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default Skills;