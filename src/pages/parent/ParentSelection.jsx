import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageCircle, PlayCircle } from 'lucide-react';

const ParentSelection = () => {
  const navigate = useNavigate();

  // Parent ka naam lo localStorage se
  const userStr  = localStorage.getItem('user');
  let parentName = 'Parent';
  try {
    const user = userStr ? JSON.parse(userStr) : null;
    if (user?.name) parentName = user.name.split(' ')[0];
  } catch (e) {}

  const options = [
    {
      title: 'Chat with Alexi',
      desc:  'Let your child have a fun interactive session with Alexi AI',
      icon:  <MessageCircle size={48} className="text-white" />,
      path:  '/mimi-chat',
      color: 'from-purple-400 to-indigo-500',
      emoji: '🤖',
      tag:   'AI Powered',
    },
    {
      title: 'Learning Activities',
      desc:  'Practice alphabets, numbers, colors and more at home!',
      icon:  <PlayCircle size={48} className="text-white" />,
      path:  '/parent/activities',
      color: 'from-pink-400 to-rose-500',
      emoji: '🎮',
      tag:   '12 Activities',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-pink-50 flex flex-col items-center justify-center p-6">

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12">
        <h1 className="text-5xl font-bold text-gray-800 mb-3">
          Hi, {parentName}! 👋
        </h1>
        <p className="text-xl text-gray-500">
          What would you like to do with your child today?
        </p>
      </motion.div>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl w-full">
        {options.map((opt, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.15 }}
            whileHover={{ scale: 1.04, translateY: -8 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate(opt.path)}
            className={`cursor-pointer bg-gradient-to-br ${opt.color} p-8 rounded-[32px] shadow-2xl text-white relative overflow-hidden group`}
          >
            {/* Background emoji */}
            <div className="absolute -right-4 -top-4 text-8xl opacity-20
              group-hover:opacity-30 group-hover:rotate-12 transition-all duration-300">
              {opt.emoji}
            </div>

            {/* Tag */}
            <div className="absolute top-4 right-4 px-3 py-1 bg-white/20
              backdrop-blur rounded-full text-xs font-bold">
              {opt.tag}
            </div>

            {/* Icon */}
            <div className="bg-white/20 w-20 h-20 rounded-3xl flex items-center
              justify-center mb-6 group-hover:bg-white/30 transition-colors">
              {opt.icon}
            </div>

            {/* Text */}
            <h2 className="text-3xl font-bold mb-2">{opt.title}</h2>
            <p className="text-white/80 text-lg leading-snug">{opt.desc}</p>

            {/* Arrow */}
            <div className="mt-6 flex items-center gap-2 text-white/70 font-semibold">
              <span>Let's Go</span>
              <span className="text-xl group-hover:translate-x-2 transition-transform">→</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Back to Portal */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        onClick={() => navigate('/parent/home')}
        className="mt-10 text-gray-400 hover:text-gray-600 text-sm font-semibold transition-colors">
        ← Go to Parent Portal
      </motion.button>
    </div>
  );
};

export default ParentSelection;