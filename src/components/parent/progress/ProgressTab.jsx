import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../../utils/api';
import { API_ENDPOINTS } from '../../../config';
import { Card, SkeletonLoader, Badges, Levels, Skills } from '../../../components/shared';
import ClassLeaderboard from '../ClassLeaderboard';
import { TrendingUp, Award, BookOpen, Users } from 'lucide-react';

const ProgressTab = ({ selectedChild }) => {
  const [starsData, setStarsData] = useState({
    total_stars: 0,
    today_stars: 0,
    today_count: 0,
    results: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

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
          <div className="text-5xl mb-3">👶</div>
          <p className="text-text/60 font-semibold">No child selected</p>
          <p className="text-sm text-text/40 mt-1">Please select a child to view progress</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-40" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <SkeletonLoader key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'badges', label: 'Badges', icon: Award },
    { id: 'skills', label: 'Skills', icon: BookOpen },
    { id: 'leaderboard', label: 'Leaderboard', icon: Users },
  ];

  const totalStars = starsData.total_stars;
  const todayStars = starsData.today_stars;
  const todayCount = starsData.today_count;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">
          📊 {selectedChild.name}'s Progress
        </h1>
        <p className="text-text/60">Track learning achievements and growth</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Award size={20} className="text-blue-700" />
            <p className="text-sm text-blue-700 font-semibold">Total Stars</p>
          </div>
          <motion.div
            key={totalStars}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <p className="text-3xl font-bold text-blue-900">{totalStars} ⭐</p>
          </motion.div>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-green-700" />
            <p className="text-sm text-green-700 font-semibold">Today</p>
          </div>
          <p className="text-3xl font-bold text-green-900">{todayStars} ⭐</p>
          <p className="text-xs text-green-700 mt-1">{todayCount} activities</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={20} className="text-purple-700" />
            <p className="text-sm text-purple-700 font-semibold">Activities</p>
          </div>
          <p className="text-3xl font-bold text-purple-900">{starsData.results.length}</p>
          <p className="text-xs text-purple-700 mt-1">Completed</p>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-orange-700" />
            <p className="text-sm text-orange-700 font-semibold">Avg Score</p>
          </div>
          <p className="text-3xl font-bold text-orange-900">
            {starsData.results.length > 0 
              ? (starsData.results.reduce((sum, r) => sum + r.stars, 0) / starsData.results.length).toFixed(1)
              : '0.0'
            }
          </p>
          <p className="text-xs text-orange-700 mt-1">out of 5.0</p>
        </Card>
      </div>

      {/* Tab Navigation */}
      <Card>
        <div className="flex flex-wrap gap-2 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Level Progress */}
              <Levels studentStars={totalStars} showTitle={true} />
              
              {/* Recent Activity */}
              <div>
                <h3 className="text-lg font-bold text-text mb-4">📈 Recent Activity</h3>
                {starsData.results.slice(0, 5).length > 0 ? (
                  <div className="space-y-3">
                    {starsData.results.slice(0, 5).map((result, index) => (
                      <motion.div
                        key={result.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <h4 className="font-semibold text-text">{result.activityName}</h4>
                          <p className="text-sm text-text/60">
                            {new Date(result.timestamp).toLocaleDateString()} at{' '}
                            {new Date(result.timestamp).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg">
                            {[...Array(5)].map((_, i) => (
                              <span key={i}>{i < result.stars ? '⭐' : '☆'}</span>
                            ))}
                          </div>
                          <p className="text-sm text-text/60">{result.score}%</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-text/40">
                    <div className="text-4xl mb-2">📚</div>
                    <p>No activities completed yet</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'badges' && (
            <Badges studentStars={totalStars} showTitle={false} />
          )}

          {activeTab === 'skills' && (
            <Skills studentStars={totalStars} showTitle={false} />
          )}

          {activeTab === 'leaderboard' && (
            <ClassLeaderboard childName={selectedChild.name} showTitle={false} />
          )}
        </motion.div>
      </Card>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center gap-4">
          <div className="text-4xl">🎯</div>
          <div>
            <h3 className="font-bold text-green-900">Keep Up the Great Work!</h3>
            <p className="text-sm text-green-800">
              {totalStars === 0 
                ? `${selectedChild.name} is just getting started! Every star counts! 🌟`
                : totalStars < 10 
                ? `${selectedChild.name} is building momentum! ${10 - totalStars} more stars to reach 10! 🚀`
                : totalStars < 50 
                ? `${selectedChild.name} is doing amazing! ${50 - totalStars} more stars to reach 50! 🏆`
                : `${selectedChild.name} is a learning superstar! Keep exploring and growing! 🌟`
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProgressTab;