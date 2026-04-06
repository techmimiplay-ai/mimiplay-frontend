/**
 * data/activities.js
 * ─────────────────────────────────────────────────────────────
 * Static activity metadata. Defined at module level so the
 * array reference is stable across renders — critical for
 * React.memo() on MimiActivityOverlay to bail out correctly.
 *
 * IMPORTANT: Never move this inside a React component.
 */
const ACTIVITIES = [
  {
    id: 1, name: 'Alphabet Practice', icon: '🔤', category: 'Alphabets',
    avgTime: '15 min', studentsCompleted: 156, avgScore: 4.5,
    description: 'Learn and practice letters with pronunciation and examples',
  },
  {
    id: 2, name: 'Phonics Basics', icon: '🔊', category: 'Phonics',
    avgTime: '12 min', studentsCompleted: 128, avgScore: 4.0,
    description: 'Understanding letter sounds and phonetic patterns',
  },
  {
    id: 3, name: 'Fruits Recognition', icon: '🍎', category: 'Objects',
    avgTime: '10 min', studentsCompleted: 142, avgScore: 4.2,
    description: 'Identify and name common fruits with visual aids',
  },
  {
    id: 4, name: 'Animal Names', icon: '🐾', category: 'Objects',
    avgTime: '8 min', studentsCompleted: 134, avgScore: 4.6,
    description: 'Learn animal names and their sounds',
  },
  {
    id: 5, name: 'Colors Matching', icon: '🎨', category: 'Colors',
    avgTime: '10 min', studentsCompleted: 145, avgScore: 4.8,
    description: 'Match objects with their colors',
  },
  {
    id: 6, name: 'Number Counting', icon: '🔢', category: 'Numbers',
    avgTime: '12 min', studentsCompleted: 138, avgScore: 4.3,
    description: 'Count objects and recognize numbers 1–10+',
  },
  {
    id: 7, name: 'Body Parts', icon: '👀', category: 'Body',
    avgTime: '10 min', studentsCompleted: 0, avgScore: 0,
    description: 'Learn body part names from head to toe',
  },
  {
    id: 8, name: 'Shapes', icon: '🔷', category: 'Shapes',
    avgTime: '8 min', studentsCompleted: 0, avgScore: 0,
    description: 'Identify and name basic to complex shapes',
  },
  {
    id: 9, name: 'Picture Guess', icon: '🖼️', category: 'Guess',
    avgTime: '10 min', studentsCompleted: 0, avgScore: 0, isAI: true,
    description: 'Big emoji shown — child guesses the name. Fresh AI questions every session!',
  },
  {
    id: 10, name: 'Counting Game', icon: '🔢', category: 'Numbers',
    avgTime: '10 min', studentsCompleted: 0, avgScore: 0, isAI: true,
    description: 'Count emoji items — harder levels include addition. AI-powered!',
  },
  {
    id: 11, name: 'Pattern Fun', icon: '🔴', category: 'Patterns',
    avgTime: '12 min', studentsCompleted: 0, avgScore: 0, isAI: true,
    description: 'Complete AB, ABC, skip-count patterns. Fresh AI questions every session!',
  },
  {
    id: 12, name: 'Quiz Mode', icon: '🏆', category: 'Mixed',
    avgTime: '15 min', studentsCompleted: 0, avgScore: 0, isAI: true,
    description: 'Mixed quiz from all activities. 15 questions, shuffled every session!',
  },
];

export default ACTIVITIES;
