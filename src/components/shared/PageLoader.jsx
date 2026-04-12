import { motion } from 'framer-motion';

const DOTS = ['#60a5fa', '#a78bfa', '#f9a8d4'];

const BouncingDots = () => (
  <div className="flex items-center gap-2">
    {DOTS.map((color, i) => (
      <motion.div
        key={i}
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.15 }}
        style={{ background: color }}
        className="w-3 h-3 rounded-full"
      />
    ))}
  </div>
);

/**
 * PageLoader — unified loading component for all pages
 *
 * @param {'fullscreen'|'overlay'|'inline'} variant
 *   fullscreen — replaces the whole page (initial data load)
 *   overlay    — blurred backdrop over existing content (e.g. MimiChat thinking)
 *   inline     — fits inside a container (tab/section load)
 * @param {string} emoji   — e.g. '🤔' '🌸' '⭐'  (default '✨')
 * @param {string} text    — label below dots        (default 'Loading…')
 */
const PageLoader = ({ variant = 'fullscreen', emoji = '✨', text = 'Loading…' }) => {
  const card = (
    <div className="flex flex-col items-center gap-4 bg-white/95 rounded-3xl px-10 py-8 shadow-xl border-2 border-purple-100">
      <motion.span
        animate={{ scale: [1, 1.15, 1] }}
        transition={{ duration: 1.4, repeat: Infinity }}
        className="text-5xl select-none"
      >
        {emoji}
      </motion.span>
      <BouncingDots />
      <p className="font-display font-bold text-text/70 text-base">{text}</p>
    </div>
  );

  if (variant === 'inline') {
    return (
      <div className="flex items-center justify-center py-16">
        {card}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`
        flex items-center justify-center z-50
        ${variant === 'fullscreen'
          ? 'min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50'
          : 'fixed inset-0 bg-white/60 backdrop-blur-sm'}
      `}
    >
      {card}
    </motion.div>
  );
};

export default PageLoader;
