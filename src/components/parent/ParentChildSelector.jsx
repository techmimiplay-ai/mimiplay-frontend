import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ParentChildSelector = ({ childrenList = [], selectedChild, onSelectChild }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef(null);

  const children = childrenList.map(child => ({
    ...child,
    id: child.id || child._id,
    avatar: child.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?',
  }));

  const selected = selectedChild
    ? { ...selectedChild, avatar: selectedChild.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?' }
    : children[0];

  // Update dropdown position when button position changes
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  if (!selected) return null;

  const dropdownContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          style={{
            position: 'fixed',
            top: `${position.top}px`,
            right: `${position.right}px`,
            zIndex: 99999,
          }}
          className="bg-white rounded-xl shadow-2xl border-2 border-gray-200 w-56 sm:w-56 md:w-64 lg:w-64"
        >
          {children.map((child) => (
            <motion.button
              key={child.id}
              onClick={() => {
                onSelectChild(child);
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors text-left ${selected.id === child.id ? 'bg-primary-50 border-l-4 border-primary-600' : ''
                }`}
            >
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-primary-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                {child.avatar}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-text">{child.name}</p>
                <p className="text-xs text-text/60">Age {child.age}</p>
              </div>
              {selected.id === child.id && (
                <div className="w-2 h-2 bg-primary-600 rounded-full flex-shrink-0" />
              )}
            </motion.button>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 sm:px-3 md:px-4 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-primary-400 to-primary-500 text-white hover:shadow-lg transition-shadow relative"
      >
        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">
          {selected.avatar}
        </div>
        {/* Mobile: sirf naam - chhota */}
        <p className="font-semibold text-xs block md:hidden max-w-[60px] truncate">{selected.name}</p>
        {/* Desktop: My Child + naam */}
        <div className="text-left hidden md:block">
          <p className="text-xs text-white/80">My Child</p>
          <p className="font-semibold text-sm">{selected.name}</p>
        </div>
        <ChevronDown
          size={14}
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {createPortal(dropdownContent, document.body)}
    </>
  );
};

export default ParentChildSelector;
