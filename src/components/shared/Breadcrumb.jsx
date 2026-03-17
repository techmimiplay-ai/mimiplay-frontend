import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const Breadcrumb = ({ items = [], onNavigate }) => {
  const navigate = useNavigate();

  const handleClick = (path) => {
    if (onNavigate) {
      onNavigate(path);
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 px-4 py-3 bg-white rounded-xl border-2 border-gray-100 mb-4"
    >
      {/* Home Icon */}
      <button
        onClick={() => handleClick('/')}
        className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
      >
        <Home size={18} />
        <span className="text-sm font-semibold">Home</span>
      </button>

      {/* Breadcrumb Items */}
      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight size={16} className="text-gray-400" />
          {item.path ? (
            <button
              onClick={() => handleClick(item.path)}
              className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline transition-colors"
            >
              {item.label}
            </button>
          ) : (
            <span className="text-sm font-medium text-text">
              {item.label}
            </span>
          )}
        </div>
      ))}
    </motion.div>
  );
};

export default Breadcrumb;
