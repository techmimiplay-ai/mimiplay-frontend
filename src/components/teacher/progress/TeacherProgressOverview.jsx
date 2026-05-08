import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { apiRequest } from '../../../utils/api';
import { API_ENDPOINTS } from '../../../config';
import { Card, SkeletonLoader, Badges, Levels, Skills } from '../../../components/shared';
import { Users, TrendingUp, Award, BookOpen, Star } from 'lucide-react';

const TeacherProgressOverview = () => {
  const [studentsData, setStudentsData] = useState([]);
  const [badges, setBadges] = useState([]);
  const [levels, setLevels] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, badgesRes, levelsRes, skillsRes] = await Promise.all([
        apiRequest('get', API_ENDPOINTS.ADMIN_ALL_STUDENTS_WITH_STATS),
        apiRequest('get', API_ENDPOINTS.CONFIG_BADGES),
        apiRequest('get', API_ENDPOINTS.CONFIG_LEVELS),
        apiRequest('get', API_ENDPOINTS.CONFIG_SKILLS)
      ]);

      setStudentsData(studentsRes || []);
      setBadges(badgesRes?.badges || []);
      setLevels(levelsRes?.levels || []);
      setSkills(skillsRes?.skills || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getClassStats = () => {
    if (studentsData.length === 0) return { totalStars: 0, avgScore: 0, totalActivities: 0 };
    
    const totalStars = studentsData.reduce((sum, student) => sum + (student.total_stars || 0), 0);
    const avgScore = studentsData.reduce((sum, student) => sum + (student.avg_score || 0), 0) / studentsData.length;
    
    return {
      totalStars,
      avgScore: avgScore.toFixed(1),
      totalActivities: studentsData.length * 10 // Estimate
    };
  };

  const getTopPerformers = () => {
    return studentsData
      .sort((a, b) => (b.total_stars || 0) - (a.total_stars || 0))
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonLoader className="h-40" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <SkeletonLoader key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  const classStats = getClassStats();
  const topPerformers = getTopPerformers();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-text mb-2">
          📊 Class Progress Overview
        </h1>
        <p className="text-text/60">Monitor student achievements and learning progress</p>
      </div>

      {/* Class Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-blue-700" />
            <p className="text-sm text-blue-700 font-semibold">Total Students</p>
          </div>
          <p className="text-3xl font-bold text-blue-900">{studentsData.length}</p>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
          <div className="flex items-center gap-2 mb-2">
            <Star size={20} className="text-yellow-700" />
            <p className="text-sm text-yellow-700 font-semibold">Class Stars</p>
          </div>
          <p className="text-3xl font-bold text-yellow-900">{classStats.totalStars} ⭐</p>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} className="text-green-700" />
            <p className="text-sm text-green-700 font-semibold">Avg Score</p>
          </div>
          <p className="text-3xl font-bold text-green-900">{classStats.avgScore}</p>
          <p className="text-xs text-green-700 mt-1">out of 5.0</p>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <div className="flex items-center gap-2 mb-2">
            <Award size={20} className="text-purple-700" />
            <p className="text-sm text-purple-700 font-semibold">Top Performer</p>
          </div>
          <p className="text-lg font-bold text-purple-900">
            {topPerformers[0]?.name || 'No data'}
          </p>
          <p className="text-xs text-purple-700 mt-1">
            {topPerformers[0]?.total_stars || 0} stars
          </p>
        </Card>
      </div>

      {/* Top Performers */}
      <Card>
        <h2 className="text-xl font-bold text-text mb-4 flex items-center gap-2">
          <Award className="text-yellow-500" />
          Top 5 Performers
        </h2>
        <div className="space-y-3">
          {topPerformers.map((student, index) => (
            <motion.div
              key={student._id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all ${
                index === 0 
                  ? 'bg-gradient-to-r from-yellow-100 to-yellow-200 border-yellow-300' 
                  : index === 1 
                  ? 'bg-gradient-to-r from-gray-100 to-gray-200 border-gray-300'
                  : index === 2 
                  ? 'bg-gradient-to-r from-amber-100 to-amber-200 border-amber-300'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => setSelectedStudent(student)}
            >
              <div className="flex items-center gap-4">
                <div className="text-2xl">
                  {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
                </div>
                <div>
                  <h3 className="font-semibold">{student.name}</h3>
                  <p className="text-sm text-text/60">
                    Class: {student.class} • Roll: {student.roll_number}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-lg">{student.total_stars || 0} ⭐</p>
                <p className="text-sm text-text/60">Avg: {student.avg_score || 0}/5</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Card>

      {/* Student Detail Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">
                    📊 {selectedStudent.name}'s Progress
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Class: {selectedStudent.class} • Roll: {selectedStudent.roll_number}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedStudent(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh] space-y-6">
              {/* Student Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedStudent.total_stars || 0}</div>
                  <p className="text-sm text-gray-600">Total Stars</p>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedStudent.avg_score || 0}</div>
                  <p className="text-sm text-gray-600">Avg Score</p>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedStudent.attendance || 0}%</div>
                  <p className="text-sm text-gray-600">Attendance</p>
                </Card>
                <Card className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedStudent.face_registered ? '✅' : '❌'}
                  </div>
                  <p className="text-sm text-gray-600">Face Registered</p>
                </Card>
              </div>

              {/* Progress Components */}
              <div className="space-y-6">
                <Levels studentStars={selectedStudent.total_stars || 0} showTitle={true} />
                <Badges studentStars={selectedStudent.total_stars || 0} showTitle={true} />
                <Skills studentStars={selectedStudent.total_stars || 0} showTitle={true} />
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Class Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Badge Distribution */}
        <Card>
          <h3 className="font-bold text-text mb-4 flex items-center gap-2">
            <Award size={20} />
            Badge Progress Overview
          </h3>
          <div className="space-y-3">
            {badges.slice(0, 5).map((badge, index) => {
              const studentsWithBadge = studentsData.filter(s => (s.total_stars || 0) >= badge.unlockAt).length;
              const percentage = studentsData.length > 0 ? (studentsWithBadge / studentsData.length) * 100 : 0;
              
              return (
                <div key={badge.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{badge.icon}</span>
                      <span className="font-semibold text-sm">{badge.name}</span>
                    </div>
                    <span className="text-sm text-text/60">
                      {studentsWithBadge}/{studentsData.length} students
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className="h-2 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Skills Distribution */}
        <Card>
          <h3 className="font-bold text-text mb-4 flex items-center gap-2">
            <BookOpen size={20} />
            Skills Unlocked
          </h3>
          <div className="space-y-3">
            {skills.map((skill, index) => {
              const studentsWithSkill = studentsData.filter(s => (s.total_stars || 0) >= skill.unlocksAt).length;
              const percentage = studentsData.length > 0 ? (studentsWithSkill / studentsData.length) * 100 : 0;
              
              return (
                <div key={index} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {skill.name === 'Alphabets' ? '🔤' : 
                         skill.name === 'Common Fruits' ? '🍎' :
                         skill.name === 'Colors' ? '🌈' :
                         skill.name === 'Animals' ? '🐾' :
                         skill.name === 'Numbers' ? '🔢' :
                         skill.name === 'Phonics' ? '🗣️' : '📚'}
                      </span>
                      <span className="font-semibold text-sm">{skill.name}</span>
                    </div>
                    <span className="text-sm text-text/60">
                      {studentsWithSkill}/{studentsData.length} students
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <motion.div
                      className={`h-2 rounded-full bg-${skill.color}-400`}
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: index * 0.1 }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Class Insights */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <div className="flex items-center gap-4">
          <div className="text-4xl">📈</div>
          <div>
            <h3 className="font-bold text-green-900">Class Insights</h3>
            <p className="text-sm text-green-800">
              {studentsData.length === 0 
                ? 'No student data available yet.'
                : classStats.avgScore >= 4.0 
                ? `Excellent class performance! Average score of ${classStats.avgScore}/5.0 shows strong learning progress! 🎉`
                : classStats.avgScore >= 3.0 
                ? `Good class progress with ${classStats.avgScore}/5.0 average. Encourage more practice for improvement! 📚`
                : `Class needs attention. Average score of ${classStats.avgScore}/5.0 suggests more support is needed. 💪`
              }
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default TeacherProgressOverview;