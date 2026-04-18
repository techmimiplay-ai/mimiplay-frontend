/**
 * MimiCustomizer
 * ──────────────
 * Floating customizer panel — lets users change:
 *   • Background (4 options, child-friendly themes)
 *   • Mimi's Outfit (3 options, non-default shows "Coming Soon")
 *
 * Usage: Just drop <MimiCustomizer /> inside MimiChat.jsx or StudentInterface.jsx
 * No props needed — it uses useMimiCustomizer hook internally.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useMimiCustomizer, { BACKGROUNDS, OUTFITS } from '../../hooks/useMimiCustomizer';

// ─────────────────────────────────────────────────────────────────────────────
// Styles (inline — no extra CSS file needed)
// ─────────────────────────────────────────────────────────────────────────────
const S = {
  // Floating trigger button
  fabWrap: {
    position:    'fixed',
    bottom:      24,
    right:       24,
    zIndex:      100,
  },
  fab: {
    width:        52,
    height:       52,
    borderRadius: '50%',
    background:   'linear-gradient(135deg, #a78bfa, #60a5fa)',
    border:       '3px solid rgba(255,255,255,0.85)',
    boxShadow:    '0 6px 20px rgba(0,0,0,0.25)',
    cursor:       'pointer',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    fontSize:     22,
  },

  // Panel backdrop (click outside to close)
  backdrop: {
    position:   'fixed',
    inset:      0,
    zIndex:     99,
    background: 'rgba(0,0,0,0.25)',
    backdropFilter: 'blur(4px)',
  },

  // Slide-in panel
  panel: {
    position:    'fixed',
    bottom:      88,
    right:       24,
    zIndex:      100,
    width:       300,
    maxHeight:   '80vh',
    overflowY:   'auto',
    background:  'rgba(255,255,255,0.97)',
    borderRadius: 24,
    padding:     '18px 16px 20px',
    boxShadow:   '0 20px 60px rgba(0,0,0,0.2)',
    border:      '2px solid rgba(167,139,250,0.2)',
    fontFamily:  "'Nunito', 'Varela Round', cursive",
  },

  // Panel header
  panelHeader: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'space-between',
    marginBottom:   14,
  },
  panelTitle: {
    fontSize:   17,
    fontWeight: 800,
    color:      '#374151',
    display:    'flex',
    alignItems: 'center',
    gap:        6,
  },
  closeBtn: {
    background:   'rgba(243,244,246,0.8)',
    border:       'none',
    borderRadius: '50%',
    width:        28,
    height:       28,
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    cursor:       'pointer',
    fontSize:     14,
    color:        '#6b7280',
  },

  // Section label
  sectionLabel: {
    fontSize:     12,
    fontWeight:   700,
    color:        '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    marginBottom: 8,
    marginTop:    14,
  },

  // Options grid
  optionsGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap:                 8,
  },

  // Background options grid (4 columns for 8 items)
  bgGrid: {
    display:             'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap:                 6,
  },

  // Option card
  optionCard: (active, available = true) => ({
    borderRadius: 12,
    overflow:     'hidden',
    border:       `2px solid ${active ? '#a78bfa' : 'rgba(0,0,0,0.08)'}`,
    cursor:       available ? 'pointer' : 'not-allowed',
    opacity:      available ? 1 : 0.65,
    transition:   'border-color 0.2s, transform 0.15s',
    transform:    active ? 'scale(1.03)' : 'scale(1)',
    background:   'white',
    position:     'relative',
  }),

  // Thumbnail area inside card
  thumb: (gradient) => ({
    height:     56,
    background: gradient,
    display:    'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize:   24,
  }),

  // Thumbnail for bg cards (smaller, 4-col grid)
  bgThumb: (style) => ({
    height:             44,
    backgroundImage:    style,
    backgroundSize:     'cover',
    backgroundPosition: 'center',
  }),

  // Card label
  cardLabel: (active) => ({
    fontSize:    11,
    fontWeight:  700,
    textAlign:   'center',
    padding:     '5px 4px',
    color:       active ? '#7c3aed' : '#6b7280',
    background:  active ? '#f5f3ff' : '#f9fafb',
    borderTop:   '1px solid rgba(0,0,0,0.06)',
  }),

  // "Coming soon" badge
  comingSoonBadge: {
    position:    'absolute',
    top:         4,
    right:       4,
    fontSize:    9,
    fontWeight:  700,
    background:  'rgba(251,146,60,0.9)',
    color:       'white',
    padding:     '2px 5px',
    borderRadius: 6,
    letterSpacing: '0.04em',
  },

  // Selected checkmark
  checkmark: {
    position:     'absolute',
    top:          4,
    left:         4,
    width:        18,
    height:       18,
    borderRadius: '50%',
    background:   '#7c3aed',
    display:      'flex',
    alignItems:   'center',
    justifyContent: 'center',
    fontSize:     10,
    color:        'white',
    fontWeight:   800,
  },

  // Footer note
  footerNote: {
    marginTop:  12,
    fontSize:   10,
    color:      '#9ca3af',
    textAlign:  'center',
    lineHeight: 1.5,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

const BgCard = ({ bg, isActive, onClick }) => (
  <motion.div
    style={S.optionCard(isActive)}
    onClick={onClick}
    whileHover={{ scale: 1.04 }}
    whileTap={{ scale: 0.97 }}
  >
    <div style={S.bgThumb(bg.style)} />
    <div style={S.cardLabel(isActive)}>{bg.emoji} {bg.label}</div>
    {isActive && <div style={S.checkmark}>✓</div>}
  </motion.div>
);

const OutfitCard = ({ outfit, isActive, onClick }) => (
  <motion.div
    style={S.optionCard(isActive, outfit.available)}
    onClick={() => outfit.available && onClick()}
    whileHover={outfit.available ? { scale: 1.04 } : {}}
    whileTap={outfit.available ? { scale: 0.97 } : {}}
  >
    <div style={{ ...S.thumb('linear-gradient(135deg, #f3f4f6, #e5e7eb)') }}>
      <span>{outfit.emoji}</span>
    </div>
    <div style={S.cardLabel(isActive)}>{outfit.label}</div>
    {isActive && <div style={S.checkmark}>✓</div>}
    {!outfit.available && (
      <div style={S.comingSoonBadge}>Soon ✨</div>
    )}
  </motion.div>
);

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────
const MimiCustomizer = () => {
  const {
    selectedBg,
    selectedClothes,
    isOpen,
    setIsOpen,
    setSelectedBg,
    setSelectedClothes,
  } = useMimiCustomizer();

  return (
    <>
      {/* Panel backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="backdrop"
            style={S.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Slide-in customizer panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="panel"
            style={S.panel}
            initial={{ opacity: 0, y: 30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 350, damping: 26 }}
          >
            {/* Header */}
            <div style={S.panelHeader}>
              <span style={S.panelTitle}>
                <span>🎨</span> Customize Mimi
              </span>
              <button style={S.closeBtn} onClick={() => setIsOpen(false)}>✕</button>
            </div>

            {/* ── Background Section ── */}
            <div style={S.sectionLabel}>🌄 Background</div>
            <div style={S.bgGrid}>
              {Object.values(BACKGROUNDS).map((bg) => (
                <BgCard
                  key={bg.key}
                  bg={bg}
                  isActive={selectedBg === bg.key}
                  onClick={() => {
                    setSelectedBg(bg.key);
                  }}
                />
              ))}
            </div>

            {/* ── Outfit Section ── */}
            <div style={S.sectionLabel}>👗 Mimi's Outfit</div>
            <div style={S.optionsGrid}>
              {Object.values(OUTFITS).map((outfit) => (
                <OutfitCard
                  key={outfit.key}
                  outfit={outfit}
                  isActive={selectedClothes === outfit.key}
                  onClick={() => setSelectedClothes(outfit.key)}
                />
              ))}
            </div>

            {/* Footer note */}
            <div style={S.footerNote}>
              ✨ Pick a background and outfit for Mimi!<br />
              Your choice is saved automatically.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <div style={S.fabWrap}>
        <motion.button
          style={S.fab}
          onClick={() => setIsOpen(prev => !prev)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          animate={isOpen ? { rotate: 45 } : { rotate: 0 }}
          transition={{ duration: 0.2 }}
          title="Customize Mimi"
        >
          🎨
        </motion.button>
      </div>
    </>
  );
};

export default MimiCustomizer;