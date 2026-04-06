/**
 * data/activityWords.js
 * ─────────────────────────────────────────────────────────────
 * All static word/question banks for activities 1–12.
 * Also exports the quiz-12 builder, normalizer, and shuffler.
 */

export const ACTIVITY_WORDS = {
  1: {
    easy:   ['Apple','Ball','Cat','Dog','Hat','Rat'],
    medium: ['Elephant','Fish','Goat','Igloo','Kite','Nest','Owl'],
    hard:   ['Umbrella','Violin','Walrus','Xylophone','Yacht','Zebra','Queen','Jungle'],
  },
  2: {
    easy:   ['Bat','Can','Fan','Hen','Pen','Sun'],
    medium: ['Frog','Clap','Drum','Flat','Grin','Slim','Plum'],
    hard:   ['Bright','Crane','Dwarf','Flask','Grind','Shrub','Thrill','Whale'],
  },
  3: {
    easy:   ['Apple','Mango','Banana','Grapes','Lemon','Peach'],
    medium: ['Orange','Papaya','Guava','Lychee','Cherry','Kiwi','Plum'],
    hard:   ['Strawberry','Watermelon','Pineapple','Blueberry','Raspberry','Apricot','Pomegranate','Custard'],
  },
  4: {
    easy:   ['Cat','Dog','Cow','Duck','Hen','Rat'],
    medium: ['Horse','Sheep','Rabbit','Goat','Bear','Fox','Deer'],
    hard:   ['Elephant','Tiger','Lion','Giraffe','Dolphin','Penguin','Crocodile','Cheetah'],
  },
  5: {
    easy:   ['Red','Blue','Green','Yellow','Pink','White'],
    medium: ['Orange','Purple','Brown','Black','Grey','Violet','Maroon'],
    hard:   ['Crimson','Turquoise','Indigo','Magenta','Coral','Amber','Scarlet','Olive'],
  },
  6: {
    easy:   ['One','Two','Three','Four','Five','Six'],
    medium: ['Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen'],
    hard:   ['Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen','Twenty','Thirty'],
  },
  7: {
    easy:   ['Head','Eye','Ear','Nose','Mouth','Hand','Leg','Foot'],
    medium: ['Hair','Teeth','Tongue','Shoulder','Arm','Finger','Knee','Ankle'],
    hard:   ['Chin','Elbow','Wrist','Thumb','Heel','Toe','Neck'],
  },
  8: {
    easy:   ['Circle','Square','Triangle','Rectangle'],
    medium: ['Star','Oval','Heart','Diamond'],
    hard:   ['Pentagon','Hexagon','Octagon','Cylinder','Cone'],
  },
  // 9 = AI picture-guess   (questions generated server-side)
  9:  { easy: [], medium: [], hard: [] },
  10: {
    easy: [
      { display:'🍎🍎',               answer:'2', count:2 },
      { display:'⭐⭐⭐',             answer:'3', count:3 },
      { display:'⚽⚽⚽⚽',           answer:'4', count:4 },
      { display:'🍌🍌🍌🍌🍌',       answer:'5', count:5 },
      { display:'🐶🐶🐶',            answer:'3', count:3 },
      { display:'🍎🍎🍎🍎',          answer:'4', count:4 },
    ],
    medium: [
      { display:'🐶🐶🐶🐶🐶🐶',         answer:'6',  count:6  },
      { display:'🐱🐱🐱🐱🐱🐱🐱',       answer:'7',  count:7  },
      { display:'🐮🐮🐮🐮🐮🐮🐮🐮',     answer:'8',  count:8  },
      { display:'🦁🦁🦁🦁🦁🦁🦁🦁🦁',  answer:'9',  count:9  },
      { display:'⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐',  answer:'10', count:10 },
      { display:'🍎🍎🍎🍎🍎🍎🍎',       answer:'7',  count:7  },
    ],
    hard: [
      { display:'🍎🍎🍎 + 🍎🍎',       answer:'5', addend1:3, addend2:2 },
      { display:'⭐⭐⭐⭐ + ⭐⭐',       answer:'6', addend1:4, addend2:2 },
      { display:'🐶🐶🐶🐶 + 🐶🐶🐶',   answer:'7', addend1:4, addend2:3 },
      { display:'🍌🍌🍌 + 🍌🍌🍌🍌',   answer:'7', addend1:3, addend2:4 },
      { display:'🐱🐱 + 🐱🐱🐱🐱',     answer:'6', addend1:2, addend2:4 },
      { display:'⭐⭐⭐ + ⭐⭐⭐⭐⭐',   answer:'8', addend1:3, addend2:5 },
    ],
  },
  11: {
    easy: [
      { pattern:'🔴 → 🔵 → ?', answer:'Red',    hint:'Red'    },
      { pattern:'🔵 → 🔴 → ?', answer:'Blue',   hint:'Blue'   },
      { pattern:'🟢 → 🟡 → ?', answer:'Green',  hint:'Green'  },
      { pattern:'⭕ → 🔺 → ?', answer:'Circle', hint:'Circle' },
      { pattern:'⭐ → ⭕ → ?', answer:'Star',   hint:'Star'   },
      { pattern:'🔲 → ⭐ → ?', answer:'Square', hint:'Square' },
    ],
    medium: [
      { pattern:'🔴 → 🔵 → 🟢 → ?',  answer:'Red',    hint:'Red'    },
      { pattern:'⭕ → 🔺 → ⭐ → ?',  answer:'Circle', hint:'Circle' },
      { pattern:'1 → 2 → 3 → ?',      answer:'Four',   hint:'Four'   },
      { pattern:'2 → 4 → 6 → ?',      answer:'Eight',  hint:'Eight'  },
      { pattern:'🟡 → 🟢 → 🔵 → ?',  answer:'Yellow', hint:'Yellow' },
      { pattern:'5 → 4 → 3 → ?',      answer:'Two',    hint:'Two'    },
    ],
    hard: [
      { pattern:'1 → 3 → 5 → 7 → ?',         answer:'Nine',     hint:'Nine'     },
      { pattern:'2 → 5 → 8 → 11 → ?',         answer:'Fourteen', hint:'Fourteen' },
      { pattern:'10 → 8 → 6 → 4 → ?',         answer:'Two',      hint:'Two'      },
      { pattern:'🔴⭕ → 🔵🔺 → 🟢⭐ → ?',    answer:'Red',      hint:'Red Circle'},
      { pattern:'3 → 6 → 9 → 12 → ?',         answer:'Fifteen',  hint:'Fifteen'  },
      { pattern:'100 → 90 → 80 → 70 → ?',     answer:'Sixty',    hint:'Sixty'    },
    ],
  },
  // 12 = mixed quiz (built dynamically from activities 1–8)
  12: { easy: [], medium: [], hard: [] },
};

/* ── Helpers ─────────────────────────────────────────────────── */

export function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Build the mixed quiz (activity 12) from activities 1–8.
 * Returns a shuffled array of tagged items.
 */
export function buildQuiz12(difficulty) {
  const pickN  = (arr, n) => shuffleArray(arr).slice(0, Math.min(n, arr.length));
  const tag    = (item, source) => ({ _word: item, _source: source });
  const diff   = d => ACTIVITY_WORDS[d]?.[difficulty] ?? ACTIVITY_WORDS[d]?.easy ?? [];

  const items = [
    ...pickN(diff(1), 2).map(w => tag(w, '🔤 Alphabet')),
    ...pickN(diff(2), 2).map(w => tag(w, '🔊 Phonics')),
    ...pickN(diff(3), 2).map(w => tag(w, '🍎 Fruits')),
    ...pickN(diff(4), 2).map(w => tag(w, '🐾 Animals')),
    ...pickN(diff(5), 2).map(w => tag(w, '🎨 Colors')),
    ...pickN(diff(6), 2).map(w => tag(w, '🔢 Numbers')),
    ...pickN(diff(7), 2).map(w => tag(w, '👀 Body Parts')),
    ...pickN(diff(8), 1).map(w => tag(w, '🔷 Shapes')),
  ];
  return shuffleArray(items);
}

/**
 * Normalise server-side questions into the shape our card
 * components expect. Returns null if the list is empty.
 */
export function normalizeQuestions(activityId, questions) {
  if (!questions?.length) return null;

  if (activityId === 9)
    return questions.map(q => ({ _llmEmoji: q.emoji || '', answer: q.answer || 'Cat' }));

  if (activityId === 10)
    return questions.map(q => ({
      display:  q.display  || '🍎🍎',
      answer:   String(q.answer || '2'),
      count:    q.count   ?? null,
      addend1:  q.addend1 ?? null,
      addend2:  q.addend2 ?? null,
    }));

  if (activityId === 11)
    return questions.map(q => ({
      pattern: q.pattern || '🔴 → 🔵 → ?',
      answer:  q.answer  || 'Red',
      hint:    q.hint    || q.answer || 'Red',
    }));

  if (activityId === 12)
    return questions.map(q => {
      if (q.type === 'pattern') return { pattern: q.pattern, answer: q.answer, hint: q.hint || q.answer };
      if (q.type === 'count')   return { display: q.display, answer: String(q.answer), count: q.count ?? null, addend1: q.addend1 ?? null, addend2: q.addend2 ?? null };
      if (q.emoji)              return { _llmEmoji: q.emoji, answer: q.answer || q.word || 'Dog' };
      return q.answer || q.word || 'Dog';
    });

  return questions;
}

/** Extract the displayable label from any question item shape. */
export function getWordLabel(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (item._word)    return item._word;
  if (item._llmEmoji) return item.answer;
  if (item.answer)   return item.answer;
  if (item.hint)     return item.hint;
  return '';
}

/** Extract the canonical answer string from any question item shape. */
export function getAnswer(item) {
  if (!item) return '';
  if (typeof item === 'string') return item;
  if (item._word)  return item._word;
  if (item.answer) return item.answer;
  return '';
}

/** Strip decorative emojis from a feedback string before TTS. */
export const stripEmojis = t =>
  (t || '').replace(/🌟|💪|🎉|💬|🎤|👂|🧠|⏸️/g, '').trim();

/** Number-word ↔ digit equivalences used by local answer checker. */
export const NUM_WORDS = {
  zero:'0', one:'1', two:'2', three:'3', four:'4', five:'5',
  six:'6', seven:'7', eight:'8', nine:'9', ten:'10',
  eleven:'11', twelve:'12', thirteen:'13', fourteen:'14', fifteen:'15',
  sixteen:'16', seventeen:'17', eighteen:'18', nineteen:'19',
  twenty:'20', thirty:'30', forty:'40', fifty:'50', sixty:'60',
};
