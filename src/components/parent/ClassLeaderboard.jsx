import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../utils/api';
import { API_ENDPOINTS } from '../../config';
import { Card, SkeletonLoader, RefreshButton } from '../shared';
import { Trophy, Medal, Award, Star, TrendingUp } from 'lucide-react';

const ClassLeaderboard = ({ childName = '', showTitle = true }) => {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      
      const response = await apiRequest('get', API_ENDPOINTS.PARENT_CLASS_LEADERBOARD);
      if (response?.status === 'success') {
        setLeaderboard(response.leaderboard || []);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Trophy className="text-yellow-500" size={24} />;
      case 2: return <Medal className="text-gray-400" size={24} />;
      case 3: return <Award className="text-amber-600" size={24} />;
      default: return <span className="text-lg font-bold text-gray-600">#{rank}</span>;
    }
  };

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'from-yellow-100 to-yellow-200 border-yellow-300';
      case 2: return 'from-gray-100 to-gray-200 border-gray-300';
      case 3: return 'from-amber-100 to-amber-200 border-amber-300';
      default: return 'from-blue-50 to-blue-100 border-blue-200';
    }
  };

  const getChildRank = () => {
    return leaderboard.findIndex(student => 
      student.name.toLowerCase().includes(childName.toLowerCase()) ||
      childName.toLowerCase().includes(student.name.toLowerCase())
    ) + 1;
  };

  const getChildData = () => {
    return leaderboard.find(student => 
      student.name.toLowerCase().includes(childName.toLowerCase()) ||
      childName.toLowerCase().includes(student.name.toLowerCase())
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {showTitle && <h2 className="text-xl font-bold text-text">🏆 Class Leaderboard</h2>}
        <div className="space-y-3">
          {[...Array(10)].map((_, i) => (
            <SkeletonLoader key={i} className="h-16" />
          ))}
        </div>
      </div>
    );
  }

  const childRank = getChildRank();
  const childData = getChildData();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {showTitle && <h2 className="text-xl font-bold text-text">🏆 Class Leaderboard</h2>}
        <RefreshButton 
          onRefresh={() => fetchLeaderboard(true)}
          loading={refreshing}
          size="sm"
        />
      </div>

      {/* Child's Position Highlight */}
      {childData && childRank > 0 && (
        <Card className="bg-gradient-to-r from-purple-400 to-pink-500 text-white border-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-4xl">
                {childRank <= 3 ? getRankIcon(childRank) : '🌟'}
              </div>
              <div>
                <h3 className="text-xl font-bold">{childName}'s Position</h3>
                <p className="text-white/80">
                  Rank #{childRank} with {childData.stars} stars
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">#{childRank}</div>
              <p className="text-white/80 text-sm">out of {leaderboard.length}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Top 3 Podium */}
      {leaderboard.length >= 3 && (
        <Card>
          <h3 className="font-bold text-text mb-4 text-center">🥇 Top 3 Champions</h3>
          <div className="flex justify-center items-end gap-4 mb-6">
            
            {/* 2nd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-gradient-to-t from-gray-200 to-gray-300 rounded-t-lg p-4 h-20 flex flex-col justify-end">
                <Medal className="text-gray-500 mx-auto mb-1" size={20} />
                <span className="text-xs font-bold text-gray-700">2nd</span>
              </div>
              <div className="bg-gray-100 p-3 rounded-b-lg">
                <p className="font-semibold text-sm text-gray-800">{leaderboard[1]?.name}</p>
                <p className="text-xs text-gray-600">{leaderboard[1]?.stars} ⭐</p>
              </div>
            </motion.div>

            {/* 1st Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-center"
            >
              <div className="bg-gradient-to-t from-yellow-300 to-yellow-400 rounded-t-lg p-4 h-28 flex flex-col justify-end">
                <Trophy className="text-yellow-600 mx-auto mb-1" size={24} />
                <span className="text-sm font-bold text-yellow-800">1st</span>
              </div>
              <div className="bg-yellow-100 p-3 rounded-b-lg">
                <p className="font-bold text-sm text-yellow-900">{leaderboard[0]?.name}</p>
                <p className="text-xs text-yellow-700">{leaderboard[0]?.stars} ⭐</p>
              </div>
            </motion.div>

            {/* 3rd Place */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center"
            >
              <div className="bg-gradient-to-t from-amber-200 to-amber-300 rounded-t-lg p-4 h-16 flex flex-col justify-end">
                <Award className="text-amber-600 mx-auto mb-1" size={18} />
                <span className="text-xs font-bold text-amber-700">3rd</span>
              </div>
              <div className="bg-amber-100 p-3 rounded-b-lg">
                <p className="font-semibold text-sm text-amber-800">{leaderboard[2]?.name}</p>
                <p className="text-xs text-amber-600">{leaderboard[2]?.stars} ⭐</p>
              </div>
            </motion.div>
          </div>
        </Card>
      )}

      {/* Full Leaderboard */}
      <Card>
        <h3 className="font-bold text-text mb-4">Complete Rankings</h3>
        <div className="space-y-2">
          {leaderboard.map((student, index) => {
            const rank = index + 1;
            const isChild = student.name.toLowerCase().includes(childName.toLowerCase()) ||
                           childName.toLowerCase().includes(student.name.toLowerCase());
            
            return (
              <motion.div
                key={student.student_id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all ${
                  isChild 
                    ? 'bg-purple-50 border-purple-300 shadow-md' 
                    : rank <= 3 
                    ? `bg-gradient-to-r ${getRankColor(rank)}` 
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-10 h-10">
                    {getRankIcon(rank)}
                  </div>
                  <div>
                    <h4 className={`font-semibold ${isChild ? 'text-purple-900' : 'text-gray-800'}`}>
                      {student.name}
                      {isChild && <span className="ml-2 text-purple-600">👑</span>}
                    </h4>
                    <p className="text-sm text-gray-600">
                      Position #{rank}
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-500" />
                    <span className="font-bold text-lg">{student.stars}</span>
                  </div>
                  <p className="text-xs text-gray-500">stars</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </Card>

      {/* Motivational Message */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center gap-4">
          <div className="text-4xl">
            <TrendingUp />
          </div>
          <div>
            <h3 className="font-bold text-green-900">Keep Learning!</h3>
            <p className="text-sm text-green-800">
              {childRank > 0 && childRank <= 3 
                ? `${childName} is in the top 3! Amazing work! 🎉`
                : childRank > 0 
                ? `${childName} is doing great! Keep earning stars to climb higher! 🌟`
                : 'Every star earned is progress! Keep up the great work! 💪'
              }
            </p>
          </div>
        </div>
      </Card>

      {/* Stats Summary */}
      {leaderboard.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">{leaderboard.length}</div>
            <p className="text-sm text-gray-600">Total Students</p>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{leaderboard[0]?.stars || 0}</div>
            <p className="text-sm text-gray-600">Top Score</p>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(leaderboard.reduce((sum, s) => sum + s.stars, 0) / leaderboard.length) || 0}
            </div>
            <p className="text-sm text-gray-600">Class Average</p>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {childData ? childData.stars : 0}
            </div>
            <p className="text-sm text-gray-600">{childName}'s Stars</p>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ClassLeaderboard;