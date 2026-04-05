// /**
//  * useMimiCustomizer
//  * ─────────────────
//  * Shared hook for background + outfit selection.
//  * Saves to localStorage so choice persists after refresh.
//  *
//  * Usage:
//  *   const { selectedBg, selectedClothes, isOpen, setIsOpen,
//  *           setSelectedBg, setSelectedClothes, BACKGROUNDS, OUTFITS }
//  *         = useMimiCustomizer()
//  */

// import { useState, useCallback } from 'react';
// import bgClassroom from '../assets/images/mimi/bg.jpg'; // existing bg

// // ─────────────────────────────────────────────────────────────────────────────
// // BACKGROUNDS CONFIG
// // ─────────────────────────────────────────────────────────────────────────────
// // 'style' is used as backgroundImage on the main container.
// // When you get real images: replace the gradient with  `url(${yourImport})`
// // ─────────────────────────────────────────────────────────────────────────────
// export const BACKGROUNDS = {
//   classroom: {
//     key:     'classroom',
//     label:   'Classroom',
//     emoji:   '🏫',
//     // Uses your existing bg.jpg — the default
//     style:   `url(${bgClassroom})`,
//     // Thumbnail color for the picker card
//     thumb:   'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
//   },
//   garden: {
//     key:     'garden',
//     label:   'Garden',
//     emoji:   '🌳',
//     // Replace with: `url(${bgGarden})` once you have the image
//     style:   'linear-gradient(160deg, #a8edea 0%, #6ed6a2 35%, #228B22 100%)',
//     thumb:   'linear-gradient(135deg, #90EE90 0%, #228B22 100%)',
//   },
//   space: {
//     key:     'space',
//     label:   'Space',
//     emoji:   '🚀',
//     // Replace with: `url(${bgSpace})` once you have the image
//     style:   'linear-gradient(160deg, #0a0a2e 0%, #1a1a4e 40%, #2d1b69 70%, #4a0080 100%)',
//     thumb:   'linear-gradient(135deg, #191970 0%, #483D8B 100%)',
//   },
//   library: {
//     key:     'library',
//     label:   'Library',
//     emoji:   '📚',
//     // Replace with: `url(${bgLibrary})` once you have the image
//     style:   'linear-gradient(160deg, #f5e6c8 0%, #e8d5a3 40%, #c4a265 100%)',
//     thumb:   'linear-gradient(135deg, #DEB887 0%, #8B4513 100%)',
//   },
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // OUTFITS CONFIG
// // ─────────────────────────────────────────────────────────────────────────────
// // When 3D animated models are ready:
// //   1. Add glb path: `glb: '/mimi_frock.glb'`
// //   2. Uncomment MimiCharacter.jsx
// //   3. Pass `outfit={selectedClothes}` prop to MimiCharacter
// // ─────────────────────────────────────────────────────────────────────────────
// export const OUTFITS = {
//   uniform: {
//     key:         'uniform',
//     label:       'School Uniform',
//     emoji:       '👔',
//     available:   true,   // Currently working with existing videos
//     glb:         null,   // '/mimi_uniform.glb' ← add when 3D ready
//   },
//   frock: {
//     key:         'frock',
//     label:       'Colorful Frock',
//     emoji:       '👗',
//     available:   false,  // Shows "Coming soon" badge
//     glb:         null,   // '/mimi_frock.glb' ← add when 3D ready
//   },
//   casual: {
//     key:         'casual',
//     label:       'Casual Outfit',
//     emoji:       '👕',
//     available:   false,  // Shows "Coming soon" badge
//     glb:         null,   // '/mimi_casual.glb' ← add when 3D ready
//   },
// };

// // ─────────────────────────────────────────────────────────────────────────────
// // HOOK
// // ─────────────────────────────────────────────────────────────────────────────
// const STORAGE_BG      = 'mimi_bg';
// const STORAGE_CLOTHES = 'mimi_clothes';

// const useMimiCustomizer = () => {
//   const [selectedBg, _setSelectedBg] = useState(
//     () => localStorage.getItem(STORAGE_BG) || 'classroom'
//   );

//   const [selectedClothes, _setSelectedClothes] = useState(
//     () => localStorage.getItem(STORAGE_CLOTHES) || 'uniform'
//   );

//   const [isOpen, setIsOpen] = useState(false);

//   const setSelectedBg = useCallback((key) => {
//     localStorage.setItem(STORAGE_BG, key);
//     _setSelectedBg(key);
//   }, []);

//   const setSelectedClothes = useCallback((key) => {
//     // Only allow if outfit is available (3D model exists)
//     if (OUTFITS[key]?.available) {
//       localStorage.setItem(STORAGE_CLOTHES, key);
//       _setSelectedClothes(key);
//     }
//   }, []);

//   return {
//     selectedBg,
//     selectedClothes,
//     isOpen,
//     setIsOpen,
//     setSelectedBg,
//     setSelectedClothes,
//     BACKGROUNDS,
//     OUTFITS,
//     // Convenience: get current background CSS value
//     currentBgStyle: BACKGROUNDS[selectedBg]?.style || BACKGROUNDS.classroom.style,
//   };
// };

// export default useMimiCustomizer;

/**
 * useMimiCustomizer — FIXED VERSION
 * ─────────────────────────────────
 * Fix 1: window custom event se same-tab sync
 * Fix 2: import path issue resolved
 */

// import { useState, useEffect, useCallback } from 'react';
// import bgClassroom from '../assets/images/mimi/bg.jpg';

// export const BACKGROUNDS = {
//   classroom: {
//     key:   'classroom',
//     label: 'Classroom',
//     emoji: '🏫',
//     style: `url(${bgClassroom})`,
//     thumb: 'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
//   },
//   garden: {
//     key:   'garden',
//     label: 'Garden',
//     emoji: '🌳',
//     style: 'linear-gradient(160deg, #a8edea 0%, #6ed6a2 35%, #228B22 100%)',
//     thumb: 'linear-gradient(135deg, #90EE90 0%, #228B22 100%)',
//   },
//   space: {
//     key:   'space',
//     label: 'Space',
//     emoji: '🚀',
//     style: 'linear-gradient(160deg, #0a0a2e 0%, #1a1a4e 40%, #2d1b69 70%, #4a0080 100%)',
//     thumb: 'linear-gradient(135deg, #191970 0%, #483D8B 100%)',
//   },
//   library: {
//     key:   'library',
//     label: 'Library',
//     emoji: '📚',
//     style: 'linear-gradient(160deg, #f5e6c8 0%, #e8d5a3 40%, #c4a265 100%)',
//     thumb: 'linear-gradient(135deg, #DEB887 0%, #8B4513 100%)',
//   },
// };

// export const OUTFITS = {
//   uniform: { key: 'uniform', label: 'School Uniform', emoji: '👔', available: true  },
//   frock:   { key: 'frock',   label: 'Colorful Frock', emoji: '👗', available: false },
//   casual:  { key: 'casual',  label: 'Casual Outfit',  emoji: '👕', available: false },
// };

// const STORAGE_BG      = 'mimi_bg';
// const STORAGE_CLOTHES = 'mimi_clothes';
// const CHANGE_EVENT    = 'mimi_customizer_change';

// const useMimiCustomizer = () => {
//   const [selectedBg, setSelectedBg] = useState(
//     () => localStorage.getItem(STORAGE_BG) || 'classroom'
//   );
//   const [selectedClothes, setSelectedClothes] = useState(
//     () => localStorage.getItem(STORAGE_CLOTHES) || 'uniform'
//   );
//   const [isOpen, setIsOpen] = useState(false);

//   // Sync across all instances in same tab
//   useEffect(() => {
//     const handler = () => {
//       setSelectedBg(localStorage.getItem(STORAGE_BG) || 'classroom');
//       setSelectedClothes(localStorage.getItem(STORAGE_CLOTHES) || 'uniform');
//     };
//     window.addEventListener(CHANGE_EVENT, handler);
//     return () => window.removeEventListener(CHANGE_EVENT, handler);
//   }, []);

//   const changeBg = useCallback((key) => {
//     localStorage.setItem(STORAGE_BG, key);
//     setSelectedBg(key);
//     window.dispatchEvent(new Event(CHANGE_EVENT));
//   }, []);

//   const changeClothes = useCallback((key) => {
//     if (!OUTFITS[key]?.available) return;
//     localStorage.setItem(STORAGE_CLOTHES, key);
//     setSelectedClothes(key);
//     window.dispatchEvent(new Event(CHANGE_EVENT));
//   }, []);

//   return {
//     selectedBg,
//     selectedClothes,
//     isOpen,
//     setIsOpen,
//     setSelectedBg:      changeBg,
//     setSelectedClothes: changeClothes,
//     BACKGROUNDS,
//     OUTFITS,
//     currentBgStyle: BACKGROUNDS[selectedBg]?.style || BACKGROUNDS.classroom.style,
//   };
// };

// export default useMimiCustomizer;


/**
 * useMimiCustomizer — SVG Background Version
 * ─────────────────────────────────────────
 * Beautiful illustrated SVG backgrounds — no image files needed!
 * Default: classroom (existing bg.jpg)
 */

import { useState, useEffect, useCallback } from 'react';
import bgClassroom from '../assets/images/mimi/bg.jpg';

// ─────────────────────────────────────────────────────────────────────────────
// SVG BACKGROUNDS — inline data URIs, child-friendly illustrated scenes
// ─────────────────────────────────────────────────────────────────────────────

const gardenSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900">
  <!-- Sky gradient -->
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#87CEEB"/>
      <stop offset="100%" stop-color="#E0F7FF"/>
    </linearGradient>
    <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#5DBB63"/>
      <stop offset="100%" stop-color="#3A8C3F"/>
    </linearGradient>
    <radialGradient id="sun" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#FFE066"/>
      <stop offset="100%" stop-color="#FFB800"/>
    </radialGradient>
  </defs>

  <!-- Sky -->
  <rect width="1440" height="900" fill="url(#sky)"/>

  <!-- Sun -->
  <circle cx="1300" cy="120" r="70" fill="url(#sun)" opacity="0.95"/>
  <!-- Sun rays -->
  <g stroke="#FFD700" stroke-width="4" opacity="0.6">
    <line x1="1300" y1="30" x2="1300" y2="10"/>
    <line x1="1300" y1="210" x2="1300" y2="230"/>
    <line x1="1210" y1="120" x2="1190" y2="120"/>
    <line x1="1390" y1="120" x2="1410" y2="120"/>
    <line x1="1236" y1="56" x2="1222" y2="42"/>
    <line x1="1364" y1="184" x2="1378" y2="198"/>
    <line x1="1364" y1="56" x2="1378" y2="42"/>
    <line x1="1236" y1="184" x2="1222" y2="198"/>
  </g>

  <!-- Clouds -->
  <g opacity="0.9">
    <ellipse cx="200" cy="100" rx="90" ry="45" fill="white"/>
    <ellipse cx="260" cy="80" rx="70" ry="40" fill="white"/>
    <ellipse cx="150" cy="90" rx="60" ry="35" fill="white"/>

    <ellipse cx="700" cy="140" rx="80" ry="38" fill="white"/>
    <ellipse cx="760" cy="120" rx="65" ry="35" fill="white"/>
    <ellipse cx="650" cy="130" rx="55" ry="30" fill="white"/>

    <ellipse cx="1050" cy="80" rx="75" ry="36" fill="white"/>
    <ellipse cx="1110" cy="62" rx="58" ry="32" fill="white"/>
  </g>

  <!-- Hills background -->
  <ellipse cx="300" cy="700" rx="400" ry="200" fill="#6DC36D" opacity="0.5"/>
  <ellipse cx="1100" cy="720" rx="450" ry="210" fill="#6DC36D" opacity="0.5"/>
  <ellipse cx="720" cy="730" rx="500" ry="220" fill="#5DBB63" opacity="0.4"/>

  <!-- Ground -->
  <rect x="0" y="650" width="1440" height="250" fill="url(#grass)"/>

  <!-- Path -->
  <path d="M620 900 Q720 750 820 900" fill="#D4A76A" opacity="0.7"/>
  <ellipse cx="720" cy="880" rx="110" ry="30" fill="#D4A76A" opacity="0.6"/>

  <!-- Big tree left -->
  <rect x="130" y="400" width="28" height="280" fill="#8B5E3C"/>
  <circle cx="144" cy="370" r="100" fill="#2E8B2E"/>
  <circle cx="100" cy="410" r="70" fill="#38A838"/>
  <circle cx="190" cy="400" r="75" fill="#33962E"/>
  <circle cx="144" cy="320" r="65" fill="#2E8B2E"/>

  <!-- Big tree right -->
  <rect x="1280" y="420" width="28" height="260" fill="#8B5E3C"/>
  <circle cx="1294" cy="390" r="95" fill="#2E8B2E"/>
  <circle cx="1250" cy="425" r="68" fill="#38A838"/>
  <circle cx="1338" cy="415" r="72" fill="#33962E"/>
  <circle cx="1294" cy="340" r="62" fill="#2E8B2E"/>

  <!-- Medium tree center-left -->
  <rect x="440" y="490" width="20" height="180" fill="#8B5E3C"/>
  <circle cx="450" cy="465" r="72" fill="#2E8B2E"/>
  <circle cx="418" cy="495" r="52" fill="#38A838"/>
  <circle cx="482" cy="488" r="55" fill="#33962E"/>

  <!-- Flowers row -->
  <!-- Flower 1 -->
  <circle cx="320" cy="650" r="16" fill="#FF69B4"/>
  <circle cx="320" cy="630" r="10" fill="#FF1493"/>
  <circle cx="306" cy="640" r="10" fill="#FF69B4"/>
  <circle cx="334" cy="640" r="10" fill="#FF69B4"/>
  <circle cx="310" cy="628" r="10" fill="#FF69B4"/>
  <circle cx="330" cy="628" r="10" fill="#FF69B4"/>
  <circle cx="320" cy="638" r="7" fill="#FFD700"/>
  <rect x="318" y="650" width="4" height="30" fill="#3CB371"/>

  <!-- Flower 2 -->
  <circle cx="420" cy="648" r="15" fill="#FF8C00"/>
  <circle cx="420" cy="630" r="10" fill="#FF6600"/>
  <circle cx="407" cy="639" r="10" fill="#FF8C00"/>
  <circle cx="433" cy="639" r="10" fill="#FF8C00"/>
  <circle cx="411" cy="628" r="10" fill="#FF8C00"/>
  <circle cx="429" cy="628" r="10" fill="#FF8C00"/>
  <circle cx="420" cy="637" r="7" fill="#FFD700"/>
  <rect x="418" y="648" width="4" height="28" fill="#3CB371"/>

  <!-- Flower 3 -->
  <circle cx="900" cy="650" r="16" fill="#9370DB"/>
  <circle cx="900" cy="630" r="10" fill="#7B2FBE"/>
  <circle cx="886" cy="640" r="10" fill="#9370DB"/>
  <circle cx="914" cy="640" r="10" fill="#9370DB"/>
  <circle cx="890" cy="628" r="10" fill="#9370DB"/>
  <circle cx="910" cy="628" r="10" fill="#9370DB"/>
  <circle cx="900" cy="638" r="7" fill="#FFD700"/>
  <rect x="898" y="650" width="4" height="30" fill="#3CB371"/>

  <!-- Flower 4 -->
  <circle cx="1050" cy="648" r="15" fill="#FF4500"/>
  <circle cx="1050" cy="630" r="10" fill="#DC143C"/>
  <circle cx="1037" cy="639" r="10" fill="#FF4500"/>
  <circle cx="1063" cy="639" r="10" fill="#FF4500"/>
  <circle cx="1041" cy="628" r="10" fill="#FF4500"/>
  <circle cx="1059" cy="628" r="10" fill="#FF4500"/>
  <circle cx="1050" cy="637" r="7" fill="#FFD700"/>
  <rect x="1048" y="648" width="4" height="28" fill="#3CB371"/>

  <!-- Butterfly 1 -->
  <g transform="translate(550,300) rotate(-10)">
    <ellipse cx="-18" cy="0" rx="22" ry="14" fill="#FF69B4" opacity="0.85"/>
    <ellipse cx="18" cy="0" rx="22" ry="14" fill="#FF69B4" opacity="0.85"/>
    <ellipse cx="-12" cy="8" rx="14" ry="9" fill="#FFB6C1" opacity="0.85"/>
    <ellipse cx="12" cy="8" rx="14" ry="9" fill="#FFB6C1" opacity="0.85"/>
    <ellipse cx="0" cy="0" rx="3" ry="10" fill="#333"/>
  </g>

  <!-- Butterfly 2 -->
  <g transform="translate(850,250) rotate(8)">
    <ellipse cx="-16" cy="0" rx="20" ry="12" fill="#FFD700" opacity="0.85"/>
    <ellipse cx="16" cy="0" rx="20" ry="12" fill="#FFD700" opacity="0.85"/>
    <ellipse cx="-10" cy="7" rx="12" ry="8" fill="#FFA500" opacity="0.85"/>
    <ellipse cx="10" cy="7" rx="12" ry="8" fill="#FFA500" opacity="0.85"/>
    <ellipse cx="0" cy="0" rx="3" ry="9" fill="#333"/>
  </g>

  <!-- Birds -->
  <path d="M400 200 Q415 190 430 200" stroke="#555" stroke-width="2.5" fill="none"/>
  <path d="M440 185 Q455 175 470 185" stroke="#555" stroke-width="2.5" fill="none"/>
  <path d="M600 220 Q615 210 630 220" stroke="#555" stroke-width="2.5" fill="none"/>

  <!-- Mushrooms -->
  <rect x="680" y="660" width="12" height="22" fill="#EEE" opacity="0.8"/>
  <ellipse cx="686" cy="660" rx="20" ry="12" fill="#FF4444" opacity="0.85"/>
  <circle cx="680" cy="654" r="3" fill="white" opacity="0.9"/>
  <circle cx="692" cy="652" r="3" fill="white" opacity="0.9"/>
  <circle cx="686" cy="656" r="2" fill="white" opacity="0.9"/>

  <!-- Grass tufts -->
  <path d="M200 670 Q205 650 210 670" stroke="#3A8C3F" stroke-width="3" fill="none"/>
  <path d="M207 670 Q213 645 218 670" stroke="#3A8C3F" stroke-width="3" fill="none"/>
  <path d="M550 668 Q555 648 560 668" stroke="#3A8C3F" stroke-width="3" fill="none"/>
  <path d="M1100 670 Q1106 650 1112 670" stroke="#3A8C3F" stroke-width="3" fill="none"/>
  <path d="M1200 665 Q1206 645 1212 665" stroke="#3A8C3F" stroke-width="3" fill="none"/>
</svg>`;

const spaceSVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900">
  <defs>
    <radialGradient id="spaceBg" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1a0533"/>
      <stop offset="60%" stop-color="#0d0221"/>
      <stop offset="100%" stop-color="#000010"/>
    </radialGradient>
    <radialGradient id="planet1" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#a78bfa"/>
      <stop offset="100%" stop-color="#5b21b6"/>
    </radialGradient>
    <radialGradient id="planet2" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fb923c"/>
      <stop offset="100%" stop-color="#9a3412"/>
    </radialGradient>
    <radialGradient id="planet3" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#34d399"/>
      <stop offset="100%" stop-color="#065f46"/>
    </radialGradient>
    <radialGradient id="moonGrad" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <!-- Deep space background -->
  <rect width="1440" height="900" fill="url(#spaceBg)"/>

  <!-- Milky way band -->
  <ellipse cx="720" cy="450" rx="800" ry="120" fill="#ffffff" opacity="0.03" transform="rotate(-20 720 450)"/>
  <ellipse cx="720" cy="450" rx="600" ry="60" fill="#c4b5fd" opacity="0.04" transform="rotate(-20 720 450)"/>

  <!-- Stars - small -->
  <g fill="white">
    <circle cx="50" cy="30" r="1.5" opacity="0.9"/>
    <circle cx="120" cy="80" r="1" opacity="0.7"/>
    <circle cx="200" cy="20" r="2" opacity="0.8"/>
    <circle cx="300" cy="60" r="1.5" opacity="0.9"/>
    <circle cx="380" cy="15" r="1" opacity="0.6"/>
    <circle cx="450" cy="90" r="2" opacity="0.8"/>
    <circle cx="530" cy="35" r="1.5" opacity="0.9"/>
    <circle cx="610" cy="70" r="1" opacity="0.7"/>
    <circle cx="680" cy="25" r="2" opacity="0.85"/>
    <circle cx="760" cy="55" r="1.5" opacity="0.7"/>
    <circle cx="840" cy="10" r="1" opacity="0.9"/>
    <circle cx="920" cy="75" r="2" opacity="0.6"/>
    <circle cx="1000" cy="30" r="1.5" opacity="0.8"/>
    <circle cx="1080" cy="55" r="1" opacity="0.9"/>
    <circle cx="1150" cy="20" r="2" opacity="0.7"/>
    <circle cx="1220" cy="85" r="1.5" opacity="0.8"/>
    <circle cx="1300" cy="40" r="1" opacity="0.6"/>
    <circle cx="1380" cy="65" r="2" opacity="0.9"/>
    <circle cx="80" cy="160" r="1.5" opacity="0.7"/>
    <circle cx="175" cy="130" r="2" opacity="0.8"/>
    <circle cx="260" cy="190" r="1" opacity="0.9"/>
    <circle cx="340" cy="145" r="1.5" opacity="0.7"/>
    <circle cx="490" cy="170" r="2" opacity="0.8"/>
    <circle cx="580" cy="120" r="1" opacity="0.6"/>
    <circle cx="660" cy="180" r="1.5" opacity="0.9"/>
    <circle cx="750" cy="140" r="2" opacity="0.7"/>
    <circle cx="870" cy="160" r="1" opacity="0.8"/>
    <circle cx="950" cy="110" r="1.5" opacity="0.9"/>
    <circle cx="1020" cy="175" r="2" opacity="0.6"/>
    <circle cx="1130" cy="135" r="1" opacity="0.8"/>
    <circle cx="1200" cy="165" r="1.5" opacity="0.7"/>
    <circle cx="1350" cy="150" r="2" opacity="0.9"/>
    <circle cx="100" cy="280" r="1.5" opacity="0.8"/>
    <circle cx="210" cy="310" r="1" opacity="0.7"/>
    <circle cx="390" cy="260" r="2" opacity="0.9"/>
    <circle cx="510" cy="295" r="1.5" opacity="0.6"/>
    <circle cx="640" cy="270" r="1" opacity="0.8"/>
    <circle cx="800" cy="300" r="2" opacity="0.7"/>
    <circle cx="940" cy="250" r="1.5" opacity="0.9"/>
    <circle cx="1060" cy="285" r="1" opacity="0.8"/>
    <circle cx="1190" cy="270" r="2" opacity="0.6"/>
    <circle cx="1320" cy="290" r="1.5" opacity="0.9"/>
    <circle cx="160" cy="400" r="1" opacity="0.7"/>
    <circle cx="290" cy="380" r="2" opacity="0.8"/>
    <circle cx="430" cy="410" r="1.5" opacity="0.9"/>
    <circle cx="570" cy="390" r="1" opacity="0.6"/>
    <circle cx="710" cy="420" r="2" opacity="0.8"/>
    <circle cx="860" cy="375" r="1.5" opacity="0.7"/>
    <circle cx="1000" cy="405" r="1" opacity="0.9"/>
    <circle cx="1140" cy="385" r="2" opacity="0.8"/>
    <circle cx="1280" cy="415" r="1.5" opacity="0.6"/>
    <circle cx="1410" cy="390" r="1" opacity="0.9"/>
  </g>

  <!-- Twinkling bright stars -->
  <g filter="url(#glow)">
    <circle cx="180" cy="50" r="2.5" fill="#fff" opacity="0.95"/>
    <circle cx="560" cy="110" r="2.5" fill="#fff" opacity="0.95"/>
    <circle cx="920" cy="40" r="3" fill="#fff" opacity="0.9"/>
    <circle cx="1250" cy="100" r="2.5" fill="#fff" opacity="0.95"/>
    <circle cx="70" cy="220" r="2.5" fill="#c4b5fd" opacity="0.9"/>
    <circle cx="1370" cy="230" r="2.5" fill="#c4b5fd" opacity="0.9"/>
    <circle cx="720" cy="180" r="2" fill="#fde68a" opacity="0.9"/>
  </g>

  <!-- Star sparkles (4-pointed) -->
  <g fill="#ffffff" opacity="0.8">
    <path d="M330 50 L333 65 L346 68 L333 71 L330 86 L327 71 L314 68 L327 65 Z"/>
    <path d="M1100 90 L1102 102 L1114 104 L1102 106 L1100 118 L1098 106 L1086 104 L1098 102 Z"/>
    <path d="M680 160 L682 170 L692 172 L682 174 L680 184 L678 174 L668 172 L678 170 Z"/>
  </g>

  <!-- Large purple planet with rings -->
  <g transform="translate(180, 200)">
    <ellipse cx="0" cy="30" rx="160" ry="22" fill="#7c3aed" opacity="0.35"/>
    <circle cx="0" cy="0" r="110" fill="url(#planet1)"/>
    <!-- Planet surface details -->
    <ellipse cx="-20" cy="-20" rx="40" ry="12" fill="#7c3aed" opacity="0.3"/>
    <ellipse cx="30" cy="25" rx="30" ry="8" fill="#5b21b6" opacity="0.4"/>
    <circle cx="0" cy="0" r="110" fill="none" stroke="#c4b5fd" stroke-width="1" opacity="0.3"/>
    <!-- Rings on top -->
    <ellipse cx="0" cy="30" rx="160" ry="22" fill="none" stroke="#a78bfa" stroke-width="4" opacity="0.6"/>
    <ellipse cx="0" cy="30" rx="140" ry="18" fill="none" stroke="#7c3aed" stroke-width="3" opacity="0.4"/>
  </g>

  <!-- Saturn-like planet right side -->
  <g transform="translate(1270, 160)">
    <ellipse cx="0" cy="20" rx="130" ry="18" fill="#d97706" opacity="0.35"/>
    <circle cx="0" cy="0" r="85" fill="url(#planet2)"/>
    <ellipse cx="10" cy="-15" rx="35" ry="10" fill="#9a3412" opacity="0.4"/>
    <ellipse cx="-15" cy="20" rx="25" ry="7" fill="#7c2d12" opacity="0.35"/>
    <ellipse cx="0" cy="20" rx="130" ry="18" fill="none" stroke="#fbbf24" stroke-width="5" opacity="0.5"/>
    <ellipse cx="0" cy="20" rx="110" ry="15" fill="none" stroke="#d97706" stroke-width="3" opacity="0.35"/>
  </g>

  <!-- Green planet small -->
  <g transform="translate(720, 120)">
    <circle cx="0" cy="0" r="48" fill="url(#planet3)"/>
    <ellipse cx="-8" cy="-8" rx="16" ry="6" fill="#065f46" opacity="0.5"/>
    <ellipse cx="10" cy="12" rx="12" ry="4" fill="#047857" opacity="0.4"/>
  </g>

  <!-- Moon -->
  <g transform="translate(1050, 80)">
    <circle cx="0" cy="0" r="55" fill="url(#moonGrad)"/>
    <circle cx="-12" cy="-15" r="8" fill="#ca8a04" opacity="0.4"/>
    <circle cx="18" cy="10" r="6" fill="#ca8a04" opacity="0.35"/>
    <circle cx="5" cy="20" r="4" fill="#ca8a04" opacity="0.3"/>
    <circle cx="-20" cy="15" r="5" fill="#ca8a04" opacity="0.3"/>
  </g>

  <!-- Rocket ship -->
  <g transform="translate(600, 350) rotate(-25)">
    <!-- Body -->
    <path d="M0,-60 Q20,-60 25,-30 L25,40 Q25,55 0,60 Q-25,55 -25,40 L-25,-30 Q-20,-60 0,-60Z" fill="#e2e8f0"/>
    <!-- Window -->
    <circle cx="0" cy="-10" r="14" fill="#7dd3fc" stroke="#93c5fd" stroke-width="2"/>
    <circle cx="0" cy="-10" r="9" fill="#0ea5e9" opacity="0.8"/>
    <!-- Fins -->
    <path d="M25,30 L50,60 L25,50Z" fill="#f87171"/>
    <path d="M-25,30 L-50,60 L-25,50Z" fill="#f87171"/>
    <!-- Nose cone -->
    <path d="M0,-60 Q15,-80 0,-110 Q-15,-80 0,-60Z" fill="#f87171"/>
    <!-- Flame -->
    <path d="M-15,60 Q0,100 15,60 Q5,80 0,95 Q-5,80 -15,60Z" fill="#fbbf24" opacity="0.9"/>
    <path d="M-8,60 Q0,85 8,60 Q3,75 0,82 Q-3,75 -8,60Z" fill="#fff" opacity="0.7"/>
    <!-- Stripes -->
    <rect x="-25" y="5" width="50" height="6" fill="#f87171" opacity="0.6" rx="2"/>
    <rect x="-25" y="18" width="50" height="4" fill="#94a3b8" opacity="0.4" rx="2"/>
  </g>

  <!-- Shooting star -->
  <g opacity="0.8">
    <line x1="900" y1="300" x2="800" y2="350" stroke="white" stroke-width="2"/>
    <line x1="900" y1="300" x2="820" y2="345" stroke="white" stroke-width="1.5" opacity="0.6"/>
    <line x1="900" y1="300" x2="840" y2="338" stroke="white" stroke-width="1" opacity="0.3"/>
    <circle cx="900" cy="300" r="3" fill="white"/>
  </g>

  <!-- UFO -->
  <g transform="translate(380, 280)">
    <ellipse cx="0" cy="0" rx="55" ry="14" fill="#94a3b8"/>
    <ellipse cx="0" cy="-8" rx="30" ry="18" fill="#cbd5e1"/>
    <ellipse cx="0" cy="-12" rx="18" ry="10" fill="#7dd3fc" opacity="0.8"/>
    <!-- Lights -->
    <circle cx="-35" cy="4" r="5" fill="#fde68a"/>
    <circle cx="-18" cy="8" r="5" fill="#86efac"/>
    <circle cx="0" cy="10" r="5" fill="#f9a8d4"/>
    <circle cx="18" cy="8" r="5" fill="#86efac"/>
    <circle cx="35" cy="4" r="5" fill="#fde68a"/>
  </g>

  <!-- Astronaut -->
  <g transform="translate(1100, 420)">
    <!-- Suit body -->
    <ellipse cx="0" cy="20" rx="28" ry="35" fill="#e2e8f0"/>
    <!-- Helmet -->
    <circle cx="0" cy="-22" r="28" fill="#cbd5e1"/>
    <circle cx="0" cy="-22" r="21" fill="#7dd3fc" opacity="0.7"/>
    <circle cx="-6" cy="-28" r="6" fill="white" opacity="0.5"/>
    <!-- Arms -->
    <ellipse cx="-38" cy="10" rx="12" ry="24" fill="#e2e8f0" transform="rotate(15,-38,10)"/>
    <ellipse cx="38" cy="10" rx="12" ry="24" fill="#e2e8f0" transform="rotate(-15,38,10)"/>
    <!-- Legs -->
    <rect x="-18" y="48" width="14" height="30" fill="#cbd5e1" rx="7"/>
    <rect x="4" y="48" width="14" height="30" fill="#cbd5e1" rx="7"/>
    <!-- Backpack -->
    <rect x="18" y="-5" width="16" height="30" fill="#94a3b8" rx="4"/>
    <!-- Flag -->
    <line x1="-28" y1="5" x2="-28" y2="-40" stroke="#94a3b8" stroke-width="2"/>
    <rect x="-28" y="-40" width="30" height="18" fill="#f87171" rx="2"/>
    <line x1="-18" y1="-40" x2="-18" y2="-22" stroke="white" stroke-width="1.5"/>
    <line x1="-8" y1="-40" x2="-8" y2="-22" stroke="white" stroke-width="1.5"/>
  </g>

  <!-- Bottom nebula glow -->
  <ellipse cx="400" cy="850" rx="350" ry="120" fill="#7c3aed" opacity="0.07"/>
  <ellipse cx="1050" cy="870" rx="300" ry="100" fill="#0ea5e9" opacity="0.07"/>

  <!-- Ground (dark moon surface) -->
  <path d="M0,820 Q200,780 400,800 Q600,820 720,795 Q900,770 1100,800 Q1280,820 1440,800 L1440,900 L0,900Z" fill="#1e1b4b" opacity="0.9"/>
  <path d="M0,850 Q300,830 600,845 Q900,860 1200,840 Q1350,832 1440,845 L1440,900 L0,900Z" fill="#0f0a1e"/>

  <!-- Moon craters on ground -->
  <ellipse cx="250" cy="870" rx="60" ry="15" fill="#0f0a1e" opacity="0.6"/>
  <ellipse cx="700" cy="880" rx="45" ry="12" fill="#0f0a1e" opacity="0.5"/>
  <ellipse cx="1100" cy="865" rx="55" ry="13" fill="#0f0a1e" opacity="0.6"/>
</svg>`;

const librarySVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 900">
  <defs>
    <linearGradient id="roomBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#FFF8F0"/>
      <stop offset="100%" stop-color="#FFE8CC"/>
    </linearGradient>
    <linearGradient id="woodFloor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#C8964A"/>
      <stop offset="100%" stop-color="#A0722A"/>
    </linearGradient>
    <linearGradient id="shelf" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#8B5E3C"/>
      <stop offset="100%" stop-color="#6B4226"/>
    </linearGradient>
    <radialGradient id="lamp" cx="50%" cy="30%" r="60%">
      <stop offset="0%" stop-color="#FFF9C4"/>
      <stop offset="100%" stop-color="#F59E0B"/>
    </radialGradient>
  </defs>

  <!-- Room background -->
  <rect width="1440" height="900" fill="url(#roomBg)"/>

  <!-- Wall paneling -->
  <rect x="0" y="0" width="1440" height="620" fill="#FFF3E6"/>
  <!-- Horizontal wall trim -->
  <rect x="0" y="615" width="1440" height="10" fill="#D4A76A" opacity="0.5"/>

  <!-- Window left -->
  <rect x="60" y="80" width="200" height="280" fill="#B8E4F7" rx="10" opacity="0.7"/>
  <rect x="60" y="80" width="200" height="280" fill="none" stroke="#D4A76A" stroke-width="8" rx="10"/>
  <line x1="160" y1="80" x2="160" y2="360" stroke="#D4A76A" stroke-width="5"/>
  <line x1="60" y1="220" x2="260" y2="220" stroke="#D4A76A" stroke-width="5"/>
  <!-- Window light rays -->
  <path d="M60,80 L200,350" stroke="#FFE066" stroke-width="25" opacity="0.08"/>
  <path d="M160,80 L350,400" stroke="#FFE066" stroke-width="20" opacity="0.06"/>
  <!-- Curtains -->
  <path d="M48,70 Q80,130 55,360" fill="#F4A261" opacity="0.7"/>
  <path d="M272,70 Q240,130 265,360" fill="#F4A261" opacity="0.7"/>
  <!-- Curtain tie left -->
  <ellipse cx="68" cy="200" rx="18" ry="12" fill="#E07A35" opacity="0.8"/>
  <ellipse cx="255" cy="200" rx="18" ry="12" fill="#E07A35" opacity="0.8"/>

  <!-- Window right -->
  <rect x="1180" y="80" width="200" height="280" fill="#B8E4F7" rx="10" opacity="0.7"/>
  <rect x="1180" y="80" width="200" height="280" fill="none" stroke="#D4A76A" stroke-width="8" rx="10"/>
  <line x1="1280" y1="80" x2="1280" y2="360" stroke="#D4A76A" stroke-width="5"/>
  <line x1="1180" y1="220" x2="1380" y2="220" stroke="#D4A76A" stroke-width="5"/>
  <path d="M1168,70 Q1200,130 1175,360" fill="#F4A261" opacity="0.7"/>
  <path d="M1392,70 Q1360,130 1385,360" fill="#F4A261" opacity="0.7"/>
  <ellipse cx="1188" cy="200" rx="18" ry="12" fill="#E07A35" opacity="0.8"/>
  <ellipse cx="1372" cy="200" rx="18" ry="12" fill="#E07A35" opacity="0.8"/>

  <!-- BOOKSHELF LEFT (big) -->
  <!-- Shelf frame -->
  <rect x="300" y="50" width="340" height="570" fill="url(#shelf)" rx="6"/>
  <rect x="308" y="58" width="324" height="554" fill="#FFF8F0" rx="4"/>
  <!-- Shelf boards -->
  <rect x="300" y="180" width="340" height="14" fill="url(#shelf)"/>
  <rect x="300" y="320" width="340" height="14" fill="url(#shelf)"/>
  <rect x="300" y="460" width="340" height="14" fill="url(#shelf)"/>

  <!-- Row 1 books -->
  <rect x="318" y="70" width="28" height="104" fill="#E74C3C" rx="3"/>
  <rect x="350" y="80" width="22" height="94" fill="#F39C12" rx="3"/>
  <rect x="376" y="65" width="30" height="109" fill="#3498DB" rx="3"/>
  <rect x="410" y="75" width="25" height="99" fill="#2ECC71" rx="3"/>
  <rect x="439" y="68" width="28" height="106" fill="#9B59B6" rx="3"/>
  <rect x="471" y="78" width="22" height="96" fill="#E67E22" rx="3"/>
  <rect x="497" y="72" width="30" height="102" fill="#1ABC9C" rx="3"/>
  <rect x="531" y="70" width="24" height="104" fill="#E91E63" rx="3"/>
  <rect x="559" y="78" width="28" height="96" fill="#FF5722" rx="3"/>
  <rect x="591" y="65" width="20" height="109" fill="#607D8B" rx="3"/>
  <!-- Book spines text lines -->
  <line x1="332" y1="80" x2="332" y2="160" stroke="white" stroke-width="1.5" opacity="0.4"/>
  <line x1="363" y1="90" x2="363" y2="160" stroke="white" stroke-width="1.5" opacity="0.4"/>

  <!-- Row 2 books -->
  <rect x="318" y="200" width="25" height="112" fill="#FF9800" rx="3"/>
  <rect x="347" y="210" width="30" height="102" fill="#4CAF50" rx="3"/>
  <rect x="381" y="200" width="22" height="112" fill="#F44336" rx="3"/>
  <rect x="407" y="205" width="28" height="107" fill="#2196F3" rx="3"/>
  <rect x="439" y="198" width="25" height="114" fill="#9C27B0" rx="3"/>
  <rect x="468" y="208" width="30" height="104" fill="#FF5722" rx="3"/>
  <rect x="502" y="200" width="24" height="112" fill="#00BCD4" rx="3"/>
  <rect x="530" y="205" width="28" height="107" fill="#FFEB3B" rx="3"/>
  <rect x="562" y="198" width="22" height="114" fill="#8BC34A" rx="3"/>
  <rect x="588" y="204" width="24" height="108" fill="#FF4081" rx="3"/>

  <!-- Row 3 books -->
  <rect x="318" y="342" width="28" height="108" fill="#673AB7" rx="3"/>
  <rect x="350" y="350" width="24" height="100" fill="#FF9800" rx="3"/>
  <rect x="378" y="340" width="30" height="110" fill="#009688" rx="3"/>
  <rect x="412" y="346" width="22" height="104" fill="#F44336" rx="3"/>
  <rect x="438" y="338" width="28" height="112" fill="#3F51B5" rx="3"/>
  <rect x="470" y="348" width="25" height="102" fill="#CDDC39" rx="3"/>
  <rect x="499" y="342" width="30" height="108" fill="#FF5722" rx="3"/>
  <rect x="533" y="344" width="22" height="106" fill="#E91E63" rx="3"/>
  <rect x="559" y="338" width="28" height="112" fill="#00ACC1" rx="3"/>
  <rect x="591" y="346" width="18" height="104" fill="#8D6E63" rx="3"/>

  <!-- Row 4 books -->
  <rect x="318" y="482" width="26" height="100" fill="#43A047" rx="3"/>
  <rect x="348" y="490" width="30" height="92" fill="#E53935" rx="3"/>
  <rect x="382" y="482" width="24" height="100" fill="#1E88E5" rx="3"/>
  <rect x="410" y="486" width="28" height="96" fill="#FB8C00" rx="3"/>
  <rect x="442" y="480" width="22" height="102" fill="#8E24AA" rx="3"/>
  <rect x="468" y="488" width="30" height="94" fill="#00897B" rx="3"/>
  <rect x="502" y="482" width="25" height="100" fill="#F4511E" rx="3"/>
  <rect x="531" y="486" width="28" height="96" fill="#6D4C41" rx="3"/>
  <rect x="563" y="480" width="22" height="102" fill="#546E7A" rx="3"/>
  <rect x="589" y="486" width="20" height="96" fill="#D81B60" rx="3"/>

  <!-- BOOKSHELF RIGHT (big) -->
  <rect x="800" y="50" width="340" height="570" fill="url(#shelf)" rx="6"/>
  <rect x="808" y="58" width="324" height="554" fill="#FFF8F0" rx="4"/>
  <rect x="800" y="180" width="340" height="14" fill="url(#shelf)"/>
  <rect x="800" y="320" width="340" height="14" fill="url(#shelf)"/>
  <rect x="800" y="460" width="340" height="14" fill="url(#shelf)"/>

  <!-- Row 1 -->
  <rect x="818" y="70" width="28" height="104" fill="#E91E63" rx="3"/>
  <rect x="850" y="78" width="25" height="96" fill="#FF9800" rx="3"/>
  <rect x="879" y="68" width="30" height="106" fill="#2196F3" rx="3"/>
  <rect x="913" y="74" width="22" height="100" fill="#4CAF50" rx="3"/>
  <rect x="939" y="70" width="28" height="104" fill="#F44336" rx="3"/>
  <rect x="971" y="78" width="25" height="96" fill="#9C27B0" rx="3"/>
  <rect x="1000" y="68" width="30" height="106" fill="#FF5722" rx="3"/>
  <rect x="1034" y="74" width="22" height="100" fill="#00BCD4" rx="3"/>
  <rect x="1060" y="70" width="28" height="104" fill="#8BC34A" rx="3"/>
  <rect x="1092" y="75" width="18" height="99" fill="#607D8B" rx="3"/>

  <!-- Row 2 -->
  <rect x="818" y="200" width="25" height="112" fill="#3F51B5" rx="3"/>
  <rect x="847" y="208" width="30" height="104" fill="#F44336" rx="3"/>
  <rect x="881" y="200" width="24" height="112" fill="#FF9800" rx="3"/>
  <rect x="909" y="204" width="28" height="108" fill="#009688" rx="3"/>
  <rect x="941" y="198" width="25" height="114" fill="#E91E63" rx="3"/>
  <rect x="970" y="206" width="30" height="106" fill="#2196F3" rx="3"/>
  <rect x="1004" y="200" width="22" height="112" fill="#FFEB3B" rx="3"/>
  <rect x="1030" y="205" width="28" height="107" fill="#673AB7" rx="3"/>
  <rect x="1062" y="198" width="25" height="114" fill="#FF5722" rx="3"/>
  <rect x="1091" y="204" width="19" height="108" fill="#00ACC1" rx="3"/>

  <!-- Row 3 -->
  <rect x="818" y="342" width="28" height="108" fill="#4CAF50" rx="3"/>
  <rect x="850" y="350" width="24" height="100" fill="#E91E63" rx="3"/>
  <rect x="878" y="340" width="30" height="110" fill="#FF9800" rx="3"/>
  <rect x="912" y="346" width="22" height="104" fill="#9C27B0" rx="3"/>
  <rect x="938" y="338" width="28" height="112" fill="#2196F3" rx="3"/>
  <rect x="970" y="348" width="25" height="102" fill="#F44336" rx="3"/>
  <rect x="999" y="342" width="30" height="108" fill="#00BCD4" rx="3"/>
  <rect x="1033" y="344" width="22" height="106" fill="#8BC34A" rx="3"/>
  <rect x="1059" y="338" width="28" height="112" fill="#FF5722" rx="3"/>
  <rect x="1091" y="345" width="19" height="105" fill="#607D8B" rx="3"/>

  <!-- Row 4 -->
  <rect x="818" y="482" width="26" height="100" fill="#F44336" rx="3"/>
  <rect x="848" y="490" width="30" height="92" fill="#2196F3" rx="3"/>
  <rect x="882" y="482" width="24" height="100" fill="#FF9800" rx="3"/>
  <rect x="910" y="486" width="28" height="96" fill="#4CAF50" rx="3"/>
  <rect x="942" y="480" width="22" height="102" fill="#E91E63" rx="3"/>
  <rect x="968" y="488" width="30" height="94" fill="#9C27B0" rx="3"/>
  <rect x="1002" y="482" width="25" height="100" fill="#FF5722" rx="3"/>
  <rect x="1031" y="486" width="28" height="96" fill="#00BCD4" rx="3"/>
  <rect x="1063" y="480" width="22" height="102" fill="#FFEB3B" rx="3"/>
  <rect x="1089" y="486" width="21" height="96" fill="#8BC34A" rx="3"/>

  <!-- Reading Table (center) -->
  <ellipse cx="720" cy="660" rx="200" ry="50" fill="#8B5E3C"/>
  <ellipse cx="720" cy="650" rx="200" ry="50" fill="#A0722A"/>
  <!-- Table legs -->
  <rect x="570" y="660" width="18" height="120" fill="#8B5E3C" rx="4"/>
  <rect x="850" y="660" width="18" height="120" fill="#8B5E3C" rx="4"/>
  <rect x="685" y="660" width="18" height="130" fill="#8B5E3C" rx="4"/>
  <rect x="730" y="660" width="18" height="130" fill="#8B5E3C" rx="4"/>

  <!-- Open book on table -->
  <g transform="translate(720, 628)">
    <path d="M-70,0 Q-70,-8 -40,-10 L0,-10 L0,35 Q-30,33 -70,35Z" fill="white"/>
    <path d="M70,0 Q70,-8 40,-10 L0,-10 L0,35 Q30,33 70,35Z" fill="#FFF8F0"/>
    <!-- Page lines -->
    <line x1="-55" y1="-2" x2="-10" y2="-2" stroke="#ddd" stroke-width="1.5"/>
    <line x1="-55" y1="4" x2="-10" y2="4" stroke="#ddd" stroke-width="1.5"/>
    <line x1="-55" y1="10" x2="-10" y2="10" stroke="#ddd" stroke-width="1.5"/>
    <line x1="-55" y1="16" x2="-10" y2="16" stroke="#ddd" stroke-width="1.5"/>
    <line x1="-55" y1="22" x2="-10" y2="22" stroke="#ddd" stroke-width="1.5"/>
    <line x1="10" y1="-2" x2="55" y2="-2" stroke="#ddd" stroke-width="1.5"/>
    <line x1="10" y1="4" x2="55" y2="4" stroke="#ddd" stroke-width="1.5"/>
    <line x1="10" y1="10" x2="55" y2="10" stroke="#ddd" stroke-width="1.5"/>
    <line x1="10" y1="16" x2="55" y2="16" stroke="#ddd" stroke-width="1.5"/>
    <line x1="10" y1="22" x2="55" y2="22" stroke="#ddd" stroke-width="1.5"/>
    <line x1="0" y1="-10" x2="0" y2="35" stroke="#bbb" stroke-width="1"/>
  </g>

  <!-- Desk lamp -->
  <g transform="translate(620, 600)">
    <rect x="-5" y="0" width="10" height="50" fill="#D4A76A" rx="3"/>
    <path d="M0,0 Q-20,-30 -35,-20" stroke="#D4A76A" stroke-width="8" fill="none" stroke-linecap="round"/>
    <ellipse cx="-45" cy="-15" rx="28" ry="14" fill="#F59E0B" transform="rotate(-30,-45,-15)"/>
    <!-- Lamp glow -->
    <ellipse cx="-45" cy="10" rx="60" ry="20" fill="#FFF9C4" opacity="0.3"/>
  </g>

  <!-- Pencil holder with pencils -->
  <g transform="translate(830, 610)">
    <rect x="-15" y="0" width="30" height="35" fill="#8B5E3C" rx="4"/>
    <rect x="-10" y="-35" width="6" height="40" fill="#FFEB3B" rx="2"/>
    <polygon points="-7,-38 -4,-38 -5.5,-45" fill="#F4A261"/>
    <rect x="-2" y="-30" width="6" height="35" fill="#F87171" rx="2"/>
    <polygon points="1,-33 4,-33 2.5,-40" fill="#F4A261"/>
    <rect x="6" y="-32" width="6" height="37" fill="#60A5FA" rx="2"/>
    <polygon points="9,-35 12,-35 10.5,-42" fill="#F4A261"/>
  </g>

  <!-- Stairs/bookend decorations -->
  <g transform="translate(650, 195)">
    <rect x="0" y="0" width="18" height="30" fill="#F44336" rx="2"/>
    <rect x="10" y="-8" width="14" height="38" fill="#FF9800" rx="2"/>
    <rect x="16" y="-18" width="16" height="48" fill="#FFEB3B" rx="2"/>
  </g>
  <g transform="translate(590, 335)">
    <rect x="0" y="0" width="16" height="28" fill="#4CAF50" rx="2"/>
  </g>

  <!-- Hanging ABC banner -->
  <line x1="430" y1="30" x2="1010" y2="30" stroke="#D4A76A" stroke-width="3" stroke-dasharray="8,4"/>
  <!-- Flags -->
  <g font-family="Arial" font-weight="bold" font-size="18" text-anchor="middle">
    <polygon points="460,30 490,30 490,60 475,70 460,60" fill="#FF5252"/>
    <text x="475" y="55" fill="white">A</text>
    <polygon points="510,30 540,30 540,60 525,70 510,60" fill="#FF9800"/>
    <text x="525" y="55" fill="white">B</text>
    <polygon points="560,30 590,30 590,60 575,70 560,60" fill="#FFEB3B"/>
    <text x="575" y="55" fill="#333">C</text>
    <polygon points="610,30 640,30 640,60 625,70 610,60" fill="#4CAF50"/>
    <text x="625" y="55" fill="white">D</text>
    <polygon points="660,30 690,30 690,60 675,70 660,60" fill="#2196F3"/>
    <text x="675" y="55" fill="white">E</text>
    <polygon points="710,30 740,30 740,60 725,70 710,60" fill="#9C27B0"/>
    <text x="725" y="55" fill="white">F</text>
    <polygon points="760,30 790,30 790,60 775,70 760,60" fill="#E91E63"/>
    <text x="775" y="55" fill="white">G</text>
    <polygon points="810,30 840,30 840,60 825,70 810,60" fill="#009688"/>
    <text x="825" y="55" fill="white">H</text>
    <polygon points="860,30 890,30 890,60 875,70 860,60" fill="#FF5722"/>
    <text x="875" y="55" fill="white">I</text>
    <polygon points="910,30 940,30 940,60 925,70 910,60" fill="#3F51B5"/>
    <text x="925" y="55" fill="white">J</text>
    <polygon points="960,30 990,30 990,60 975,70 960,60" fill="#F44336"/>
    <text x="975" y="55" fill="white">K</text>
  </g>

  <!-- Wood floor -->
  <rect x="0" y="625" width="1440" height="275" fill="url(#woodFloor)"/>
  <!-- Floor planks -->
  <line x1="0" y1="660" x2="1440" y2="660" stroke="#8B5E3C" stroke-width="1.5" opacity="0.4"/>
  <line x1="0" y1="700" x2="1440" y2="700" stroke="#8B5E3C" stroke-width="1.5" opacity="0.4"/>
  <line x1="0" y1="740" x2="1440" y2="740" stroke="#8B5E3C" stroke-width="1.5" opacity="0.4"/>
  <line x1="0" y1="780" x2="1440" y2="780" stroke="#8B5E3C" stroke-width="1.5" opacity="0.4"/>
  <line x1="0" y1="820" x2="1440" y2="820" stroke="#8B5E3C" stroke-width="1.5" opacity="0.4"/>
  <line x1="240" y1="625" x2="240" y2="900" stroke="#8B5E3C" stroke-width="1" opacity="0.3"/>
  <line x1="480" y1="625" x2="480" y2="900" stroke="#8B5E3C" stroke-width="1" opacity="0.3"/>
  <line x1="720" y1="625" x2="720" y2="900" stroke="#8B5E3C" stroke-width="1" opacity="0.3"/>
  <line x1="960" y1="625" x2="960" y2="900" stroke="#8B5E3C" stroke-width="1" opacity="0.3"/>
  <line x1="1200" y1="625" x2="1200" y2="900" stroke="#8B5E3C" stroke-width="1" opacity="0.3"/>

  <!-- Floor rug -->
  <ellipse cx="720" cy="790" rx="320" ry="80" fill="#E07A35" opacity="0.4"/>
  <ellipse cx="720" cy="790" rx="280" ry="65" fill="none" stroke="#F4A261" stroke-width="4" opacity="0.5"/>
  <ellipse cx="720" cy="790" rx="240" ry="50" fill="none" stroke="#FFD700" stroke-width="2" opacity="0.4"/>
</svg>`;

// Convert SVG string to data URI
const svgToDataUri = (svg) =>
  `url("data:image/svg+xml,${encodeURIComponent(svg.trim())}")`;

export const BACKGROUNDS = {
  classroom: {
    key:     'classroom',
    label:   'Classroom',
    emoji:   '🏫',
    style:   `url(${bgClassroom})`,
    thumb:   'linear-gradient(135deg, #87CEEB 0%, #98FB98 100%)',
  },
  garden: {
    key:     'garden',
    label:   'Garden',
    emoji:   '🌳',
    style:   svgToDataUri(gardenSVG),
    thumb:   'linear-gradient(135deg, #6DC36D 0%, #228B22 60%, #87CEEB 100%)',
  },
  space: {
    key:     'space',
    label:   'Space',
    emoji:   '🚀',
    style:   svgToDataUri(spaceSVG),
    thumb:   'linear-gradient(135deg, #0a0a2e 0%, #2d1b69 60%, #4a0080 100%)',
  },
  library: {
    key:     'library',
    label:   'Library',
    emoji:   '📚',
    style:   svgToDataUri(librarySVG),
    thumb:   'linear-gradient(135deg, #DEB887 0%, #8B5E3C 60%, #F4A261 100%)',
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
    () => localStorage.getItem(STORAGE_BG) || 'classroom'
  );
  const [selectedClothes, setSelectedClothes] = useState(
    () => localStorage.getItem(STORAGE_CLOTHES) || 'uniform'
  );
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handler = () => {
      setSelectedBg(localStorage.getItem(STORAGE_BG) || 'classroom');
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
    currentBgStyle: BACKGROUNDS[selectedBg]?.style || BACKGROUNDS.classroom.style,
  };
};

export default useMimiCustomizer;