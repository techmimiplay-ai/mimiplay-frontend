import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 5, maxStars = 5, size = 'md', showNumber = true, animated = true }) => {
  
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
    xl: 80,
  };
  
  const starSize = sizes[size] || sizes.md;
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Stars */}
      <div className="flex gap-2">
        {Array.from({ length: maxStars }, (_, index) => (
          <motion.div
            key={index}
            initial={animated ? { scale: 0, rotate: -180 } : {}}
            animate={animated ? { scale: 1, rotate: 0 } : {}}
            transition={{
              type: "spring",
              delay: index * 0.1,
              duration: 0.6
            }}
          >
            <Star
              size={starSize}
              className={`
                ${index < rating 
                  ? 'fill-yellow-400 text-yellow-400' 
                  : 'fill-gray-200 text-gray-200'
                }
              `}
            />
          </motion.div>
        ))}
      </div>
      
      {/* Rating number */}
      {showNumber && (
        <motion.div
          initial={animated ? { opacity: 0, y: 10 } : {}}
          animate={animated ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-3xl font-bold text-text"
        >
          {rating}/{maxStars}
        </motion.div>
      )}
    </div>
  );
};

export default StarRating;