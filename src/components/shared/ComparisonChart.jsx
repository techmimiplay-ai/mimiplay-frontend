import React from 'react';
import { motion } from 'framer-motion';

const ComparisonChart = ({ title, data }) => {
  const maxValue = Math.max(...data.map(d => d.value));

  return (
    <div className="space-y-4">
      {title && <h3 className="text-lg font-bold text-text">{title}</h3>}

      <div className="space-y-3">
        {data.map((item, index) => {
          const percentage = (item.value / maxValue) * 100;
          const colors = [
            'from-blue-400 to-blue-500',
            'from-green-400 to-green-500',
            'from-purple-400 to-purple-500',
            'from-pink-400 to-pink-500',
            'from-yellow-400 to-yellow-500',
          ];
          const colorClass = colors[index % colors.length];

          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-text text-sm">{item.label}</span>
                <span className="text-primary-600 font-bold">{item.value}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ delay: 0.2 + index * 0.1, duration: 0.8 }}
                  className={`h-full bg-gradient-to-r ${colorClass} rounded-full`}
                />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ComparisonChart;
