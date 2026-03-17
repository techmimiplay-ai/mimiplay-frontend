import React, { useEffect, useState } from 'react';
import { Button, Card } from '../../shared';
import { motion } from 'framer-motion';
import { ConfettiAnimation } from '../ui-elements';
import { Home, RotateCcw, ArrowRight } from 'lucide-react';

const ActivityFeedbackScreen = ({ activity, score, stars, mood, onContinue }) => {
  const [showConfetti, setShowConfetti] = useState(false);
  const isGoodScore = score >= 70;

  useEffect(() => {
    if (isGoodScore) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isGoodScore]);

  const getMoodEmoji = (moodLevel) => {
    if (moodLevel >= 0.8) return '😄';
    if (moodLevel >= 0.6) return '😊';
    if (moodLevel >= 0.4) return '😐';
    return '😕';
  };

  const getFeedbackMessage = (score) => {
    if (score >= 90) return 'Outstanding! You did exceptionally well!';
    if (score >= 80) return 'Excellent work! You\'re doing great!';
    if (score >= 70) return 'Good job! Keep practicing!';
    if (score >= 60) return 'Nice effort! Try again to improve!';
    return 'Keep trying! You\'ll improve with practice!';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-100 via-cyan-50 to-blue-100 flex items-center justify-center p-4 relative overflow-hidden">
      {showConfetti && <ConfettiAnimation />}

      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="shadow-2xl border-4 border-primary-300">
          {/* Success Badge */}
          {isGoodScore && (
            <motion.div
              initial={{ rotate: -10, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg"
            >
              <span className="text-5xl">⭐</span>
            </motion.div>
          )}

          {/* Activity Name and Score */}
          <div className="text-center mb-6">
            <h2 className="text-3xl font-bold text-text mb-2">Activity Complete!</h2>
            <p className="text-2xl font-semibold text-primary-600">{activity}</p>
          </div>

          {/* Main Feedback Section */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Score Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-blue-400 to-blue-500 rounded-2xl p-6 text-white text-center"
            >
              <p className="text-sm mb-2 opacity-90">Your Score</p>
              <p className="text-5xl font-bold">{score}%</p>
              <div className="mt-2 w-full bg-white/30 rounded-full h-2">
                <div
                  className="bg-white rounded-full h-2 transition-all duration-500"
                  style={{ width: `${score}%` }}
                />
              </div>
            </motion.div>

            {/* Stars Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-2xl p-6 text-white text-center"
            >
              <p className="text-sm mb-2 opacity-90">Stars Earned</p>
              <div className="text-5xl">{Array(stars).fill('⭐').join('')}</div>
              <p className="text-xl font-bold mt-2">{stars}/5</p>
            </motion.div>

            {/* Mood Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-pink-400 to-pink-500 rounded-2xl p-6 text-white text-center"
            >
              <p className="text-sm mb-2 opacity-90">Your Mood</p>
              <p className="text-6xl mb-2">{getMoodEmoji(mood)}</p>
              <p className="text-sm font-semibold">{Math.round(mood * 100)}% Happy</p>
            </motion.div>
          </div>

          {/* Feedback Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-primary-50 to-cyan-50 rounded-2xl p-6 mb-8 border-2 border-primary-200"
          >
            <p className="text-center text-xl font-semibold text-text">
              {getFeedbackMessage(score)}
            </p>
            <div className="mt-4 text-sm text-text/70 space-y-2">
              <p className="flex items-center gap-2">
                <span className="text-lg">💡</span>
                Keep practicing different activities to improve your learning!
              </p>
              <p className="flex items-center gap-2">
                <span className="text-lg">🎯</span>
                Challenge yourself with harder levels next time!
              </p>
            </div>
          </motion.div>

          {/* Statistics Summary */}
          <div className="bg-gray-50 rounded-xl p-4 mb-8">
            <h3 className="font-semibold text-text mb-3">Session Summary</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-text/70">Time Taken:</span>
                <span className="font-semibold text-text">2m 30s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text/70">Questions Answered:</span>
                <span className="font-semibold text-text">10/12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text/70">Correct Answers:</span>
                <span className="font-semibold text-green-600">7</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text/70">Accuracy:</span>
                <span className="font-semibold text-text">{score}%</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              icon={RotateCcw}
              onClick={onContinue}
              className="flex-1"
            >
              Try Again
            </Button>
            <Button
              variant="primary"
              icon={ArrowRight}
              onClick={onContinue}
              className="flex-1"
            >
              Back to Dashboard
            </Button>
          </div>
        </Card>
      </motion.div>
    </div>
  );
};

export default ActivityFeedbackScreen;
