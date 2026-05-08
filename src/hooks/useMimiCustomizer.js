import { useState, useEffect, useCallback } from 'react';
import { getDefaultBackground, getDefaultDress } from '../utils/mimiDefaults';

export const BACKGROUNDS = {
  default: {
    key:   'default',
    label: 'Default',
    emoji: '🏠',
    style: 'url(/mimi-backgrounds/default.png)',
    thumb: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
  },
  classroom: {
    key:   'classroom',
    label: 'Classroom',
    emoji: '🏫',
    style: 'url(/mimi-backgrounds/classroom.png)',
    thumb: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
  },
  beach: {
    key:   'beach',
    label: 'Beach',
    emoji: '🏖️',
    style: 'url(/mimi-backgrounds/beach.png)',
    thumb: 'linear-gradient(135deg, #87CEEB 0%, #F4D03F 60%, #E8C99A 100%)',
  },
  forest: {
    key:   'forest',
    label: 'Forest',
    emoji: '🌲',
    style: 'url(/mimi-backgrounds/forest.png)',
    thumb: 'linear-gradient(135deg, #1a4a1a 0%, #2E8B2E 100%)',
  },
  bedroom: {
    key:   'bedroom',
    label: 'Bedroom',
    emoji: '🛏️',
    style: 'url(/mimi-backgrounds/bedroom.png)',
    thumb: 'linear-gradient(135deg, #f5e6c8 0%, #c4a265 100%)',
  },
  space: {
    key:   'space',
    label: 'Space',
    emoji: '🚀',
    style: 'url(/mimi-backgrounds/space.png)',
    thumb: 'linear-gradient(135deg, #0a0a2e 0%, #4a0080 100%)',
  },
  night: {
    key:   'night',
    label: 'Night',
    emoji: '🌙',
    style: 'url(/mimi-backgrounds/night.png)',
    thumb: 'linear-gradient(135deg, #0d0221 0%, #1a1a4e 100%)',
  },
};

export const OUTFITS = {
  uniform:    { key: 'uniform',    label: 'School Uniform', emoji: '👔', available: true },
  casual:     { key: 'casual',     label: 'Casual T-Shirt', emoji: '👕', available: true },
  overall:    { key: 'overall',    label: 'Overall',        emoji: '🧥', available: true },
  shirt_pant: { key: 'shirt_pant', label: 'Shirt & Pants',  emoji: '👗', available: true },
};

const STORAGE_BG      = 'mimi_bg';
const STORAGE_CLOTHES = 'mimi_clothes';
const CHANGE_EVENT    = 'mimi_customizer_change';

const useMimiCustomizer = () => {
  const [selectedBg, setSelectedBg] = useState(
    () => localStorage.getItem(STORAGE_BG) || getDefaultBackground()
  );
  const [selectedClothes, setSelectedClothes] = useState(
    () => localStorage.getItem(STORAGE_CLOTHES) || getDefaultDress()
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      setSelectedBg(localStorage.getItem(STORAGE_BG) || getDefaultBackground());
      setSelectedClothes(localStorage.getItem(STORAGE_CLOTHES) || getDefaultDress());
    };
    
    // Listen for customizer changes
    window.addEventListener(CHANGE_EVENT, handler);
    
    // Listen for logout events to reset to defaults
    window.addEventListener('user_logout', handler);
    
    return () => {
      window.removeEventListener(CHANGE_EVENT, handler);
      window.removeEventListener('user_logout', handler);
    };
  }, []);

  const changeBg = useCallback((key) => {
    localStorage.setItem(STORAGE_BG, key);
    setSelectedBg(key);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  const changeClothes = useCallback((key) => {
    if (!OUTFITS[key]?.available) return;
    localStorage.setItem(STORAGE_CLOTHES, key);
    setSelectedClothes(key);
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return {
    selectedBg,
    selectedClothes,
    isOpen,
    setIsOpen,
    setSelectedBg:      changeBg,
    setSelectedClothes: changeClothes,
    BACKGROUNDS,
    OUTFITS,
    currentBgStyle: BACKGROUNDS[selectedBg]?.style || BACKGROUNDS.default.style,
  };
};

export default useMimiCustomizer;
