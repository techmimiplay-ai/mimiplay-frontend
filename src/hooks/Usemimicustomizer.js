import { useState, useEffect, useCallback } from 'react';

export const BACKGROUNDS = {
  default: {
    key:   'default',
    label: 'Default',
    emoji: '🏠',
    style: 'url(/backgrounds/default.png)',
    thumb: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
  },
  classroom: {
    key:   'classroom',
    label: 'Classroom',
    emoji: '🏫',
    style: 'url(/backgrounds/classroom.png)',
    thumb: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
  },
  garden1: {
    key:   'garden1',
    label: 'Garden',
    emoji: '🌳',
    style: 'url(/backgrounds/garden1.png)',
    thumb: 'linear-gradient(135deg, #6DC36D 0%, #228B22 100%)',
  },
  garden2: {
    key:   'garden2',
    label: 'Garden 2',
    emoji: '🌸',
    style: 'url(/backgrounds/garden2.png)',
    thumb: 'linear-gradient(135deg, #a8edea 0%, #5DBB63 100%)',
  },
  beach: {
    key:   'beach',
    label: 'Beach',
    emoji: '🏖️',
    style: 'url(/backgrounds/beach.png)',
    thumb: 'linear-gradient(135deg, #87CEEB 0%, #F4D03F 60%, #E8C99A 100%)',
  },
  forest: {
    key:   'forest',
    label: 'Forest',
    emoji: '🌲',
    style: 'url(/backgrounds/forest.png)',
    thumb: 'linear-gradient(135deg, #1a4a1a 0%, #2E8B2E 100%)',
  },
  bedroom: {
    key:   'bedroom',
    label: 'Bedroom',
    emoji: '🛏️',
    style: 'url(/backgrounds/bedroom.png)',
    thumb: 'linear-gradient(135deg, #f5e6c8 0%, #c4a265 100%)',
  },
  space: {
    key:   'space',
    label: 'Space',
    emoji: '🚀',
    style: 'url(/backgrounds/space.png)',
    thumb: 'linear-gradient(135deg, #0a0a2e 0%, #4a0080 100%)',
  },
  night: {
    key:   'night',
    label: 'Night',
    emoji: '🌙',
    style: 'url(/backgrounds/night.png)',
    thumb: 'linear-gradient(135deg, #0d0221 0%, #1a1a4e 100%)',
  },
};

export const OUTFITS = {
  uniform: { key: 'uniform', label: 'School Uniform', emoji: '👔', available: true  },
  frock:   { key: 'frock',   label: 'Colorful Frock', emoji: '👗', available: false },
  casual:  { key: 'casual',  label: 'Casual Outfit',  emoji: '👕', available: false },
};

const STORAGE_BG      = 'mimi_bg';
const STORAGE_CLOTHES = 'mimi_clothes';
const CHANGE_EVENT    = 'mimi_customizer_change';

const useMimiCustomizer = () => {
  const [selectedBg, setSelectedBg] = useState(
    () => localStorage.getItem(STORAGE_BG) || 'default'
  );
  const [selectedClothes, setSelectedClothes] = useState(
    () => localStorage.getItem(STORAGE_CLOTHES) || 'uniform'
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      setSelectedBg(localStorage.getItem(STORAGE_BG) || 'default');
      setSelectedClothes(localStorage.getItem(STORAGE_CLOTHES) || 'uniform');
    };
    window.addEventListener(CHANGE_EVENT, handler);
    return () => window.removeEventListener(CHANGE_EVENT, handler);
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
