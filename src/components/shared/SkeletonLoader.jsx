import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ count = 1, type = 'card' }) => {
  const pulse = {
    opacity: [0.6, 1, 0.6],
    transition: { duration: 1.5, repeat: Infinity }
  };

  if (type === 'card') {
    return (
      <div className="space-y-3">
        {Array(count).fill(0).map((_, i) => (
          <motion.div
            key={i}
            animate={pulse}
            className="bg-gray-200 rounded-xl h-24"
          />
        ))}
      </div>
    );
  }

  if (type === 'list') {
    return (
      <div className="space-y-2">
        {Array(count).fill(0).map((_, i) => (
          <motion.div
            key={i}
            animate={pulse}
            className="flex gap-3"
          >
            <motion.div className="w-12 h-12 bg-gray-200 rounded-full" />
            <div className="flex-1 space-y-2">
              <motion.div className="h-4 bg-gray-200 rounded w-3/4" />
              <motion.div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {Array(count).fill(0).map((_, i) => (
          <motion.div
            key={i}
            animate={pulse}
            className="grid grid-cols-4 gap-4 p-4 bg-gray-200 rounded-lg"
          >
            <div className="h-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded" />
          </motion.div>
        ))}
      </div>
    );
  }

  if (type === 'avatar') {
    return (
      <div className="flex gap-4">
        {Array(count).fill(0).map((_, i) => (
          <motion.div
            key={i}
            animate={pulse}
            className="w-16 h-16 bg-gray-200 rounded-full"
          />
        ))}
      </div>
    );
  }

  return null;
};

export default SkeletonLoader;
