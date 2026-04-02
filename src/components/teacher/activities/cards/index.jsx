/**
 * cards/index.js
 * ─────────────────────────────────────────────────────────────
 * All four question-card components used inside MimiActivityOverlay.
 * Re-exported from a single index so imports stay clean:
 *
 *   import { WordCard, PictureGuessCard, CountingCard, PatternCard }
 *     from './cards';
 *
 * Shared styles are defined once at the top of this file.
 * Each card is wrapped in React.memo() so it only re-renders when
 * its own props change — the overlay state machine changes only the
 * props for the active card.
 */

import React, { memo } from 'react';
import { motion } from 'framer-motion';
import { Mic, MicOff } from 'lucide-react';

/* ── Shared style constants ──────────────────────────────────── */
const BUBBLE_CARD =
  'bg-white rounded-[2rem] shadow-2xl border-4 border-yellow-300 p-5 text-center w-full ' +
  'bg-gradient-to-b from-white to-yellow-50';

const SPEECH_BUBBLE =
  'bg-gradient-to-br from-purple-100 to-pink-100 rounded-[1.5rem] border-4 ' +
  'border-purple-300 px-6 py-4 text-center w-full shadow-lg';

const MIC_BADGE =
  'flex items-center gap-2 justify-center mt-3 bg-red-50 rounded-full ' +
  'px-5 py-2 border-2 border-red-200 animate-pulse';

/* ── Shared sub-components ───────────────────────────────────── */
const MicRow = ({ listening, phase }) =>
  phase !== 'listening' ? null : (
    <div className={MIC_BADGE}>
      {listening ? (
        <><Mic size={18} className="text-red-500" /><span className="font-black text-red-600 text-sm">Say it now! 🎤</span></>
      ) : (
        <><MicOff size={18} className="text-gray-400" /><span className="font-black text-gray-500 text-sm">Listening…</span></>
      )}
    </div>
  );

const TranscriptRow = ({ transcript }) =>
  transcript
    ? <p className="text-xs text-gray-400 mt-2">You said: "{transcript}"</p>
    : null;

const SpeechBox = ({ mimiSaying, phase, listening, transcript }) => (
  <div className={SPEECH_BUBBLE}>
    <p className="text-base font-bold text-purple-600 mb-1">{mimiSaying}</p>
    <MicRow listening={listening} phase={phase} />
    <TranscriptRow transcript={transcript} />
  </div>
);

/* ─────────────────────────────────────────────────────────────
 *  WordCard  (activities 1–8, 12-word items)
 * ───────────────────────────────────────────────────────────── */
export const WordCard = memo(function WordCard({
  word, emoji, mimiSaying, phase, listening, transcript,
  current, total, sourceBadge,
}) {
  return (
    <motion.div
      initial={{ scale: 0.5, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.5, opacity: 0 }}
      className="flex flex-col items-center gap-4 max-w-sm w-full"
    >
      {sourceBadge && (
        <span className="px-3 py-1 bg-purple-100 text-purple-600 text-xs font-black rounded-full">
          {sourceBadge}
        </span>
      )}
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-44 h-44 bg-gradient-to-br from-blue-100 to-purple-100 rounded-[2rem] shadow-2xl flex items-center justify-center text-8xl border-4 border-purple-300"
      >
        {emoji}
      </motion.div>
      <div className={BUBBLE_CARD}>
        <h2
          className="text-5xl font-black text-purple-700 mb-1"
          style={{ fontFamily: "'Fredoka One', 'Nunito', sans-serif", letterSpacing: '0.02em' }}
        >
          {word}
        </h2>
        <SpeechBox mimiSaying={mimiSaying} phase={phase} listening={listening} transcript={transcript} />
      </div>
      <div className="text-white/90 font-black text-sm bg-black/20 rounded-full px-4 py-1">
        {current + 1} / {total}
      </div>
    </motion.div>
  );
});

/* ─────────────────────────────────────────────────────────────
 *  PictureGuessCard  (activity 9, AI picture items in 12)
 * ───────────────────────────────────────────────────────────── */
export const PictureGuessCard = memo(function PictureGuessCard({
  emoji, mimiSaying, phase, listening, transcript,
}) {
  return (
    <div className="flex flex-col items-center gap-4 max-w-sm w-full">
      <motion.div
        animate={{ y: [0, -12, 0], rotate: [-2, 2, -2] }}
        transition={{ duration: 2, repeat: Infinity }}
        className="w-44 h-44 bg-gradient-to-br from-yellow-100 to-pink-100 rounded-[2rem] shadow-2xl flex items-center justify-center text-8xl border-4 border-pink-300"
      >
        {emoji || '🖼️'}
      </motion.div>
      <SpeechBox mimiSaying={mimiSaying} phase={phase} listening={listening} transcript={transcript} />
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
 *  CountingCard  (activity 10, count items in 12)
 * ───────────────────────────────────────────────────────────── */
export const CountingCard = memo(function CountingCard({
  item, mimiSaying, phase, listening, transcript,
}) {
  const isAddition = item?.addend1 != null;
  return (
    <div className="flex flex-col items-center gap-4 max-w-sm w-full">
      <div className={BUBBLE_CARD}>
        {isAddition ? (
          <>
            <p className="text-xl font-black text-purple-700 mb-2">How many in total? 🤔</p>
            <div className="text-4xl mb-2 leading-relaxed">{item.display}</div>
            <p className="text-2xl font-black text-gray-600">{item.addend1} + {item.addend2} = ?</p>
          </>
        ) : (
          <>
            <p className="text-xl font-black text-purple-700 mb-2">How many? 🔢</p>
            <div className="text-3xl leading-loose mb-2">{item?.display}</div>
          </>
        )}
      </div>
      <SpeechBox mimiSaying={mimiSaying} phase={phase} listening={listening} transcript={transcript} />
    </div>
  );
});

/* ─────────────────────────────────────────────────────────────
 *  PatternCard  (activity 11, pattern items in 12)
 * ───────────────────────────────────────────────────────────── */
export const PatternCard = memo(function PatternCard({
  item, mimiSaying, phase, listening, transcript,
}) {
  return (
    <div className="flex flex-col items-center gap-4 max-w-sm w-full">
      <div className={BUBBLE_CARD}>
        <p className="text-3xl font-black text-gray-800 mb-3">{item?.pattern}</p>
        <p className="text-sm font-semibold text-purple-500">What comes next? 🌈</p>
      </div>
      <SpeechBox mimiSaying={mimiSaying} phase={phase} listening={listening} transcript={transcript} />
    </div>
  );
});
