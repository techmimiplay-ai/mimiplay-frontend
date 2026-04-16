/**
 * MimiActivityOverlay.jsx
 * ─────────────────────────────────────────────────────────────
 * The core activity engine. Manages the full state machine:
 *
 *   waiting → intro → asking → listening → checking → result
 *     → (next question) asking …
 *     → (last question) done → between_students → waiting
 *
 * All heavy logic has been extracted into focused hooks:
 *   useSpeak          → TTS with prefetch cache (saves 4–13s per question)
 *   useFaceDetect     → camera stream, live preview, face-detect polling
 *   useSpeechRecognition → SR lifecycle with 7s timeout
 *
 * This component is wrapped in React.memo() in ActivitiesTab
 * with a stable `activity` prop (from module-level ACTIVITIES array)
 * so it never re-renders due to parent state changes.
 *
 * Performance log guide:
 *   [PHASE]   → state machine transitions
 *   [Speak]   → TTS timing, cache hits/misses
 *   [Prefetch]→ background TTS fetches
 *   [SR]      → speech recognition events and latency
 *   [FaceDetect] → per-frame API latency
 *   [LLM]     → answer-check API timing
 *   [TIMING]  → named round-trip measurements
 *   [RENDER]  → unexpected re-renders
 */

import React, {
  useState, useEffect, useRef, useCallback, memo,
} from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_BASE_URL, API_ENDPOINTS } from '../../../config';

import bgImage       from '../../../assets/images/mimi/activity_bg.jpg';
import mimiIdleVideo from '../../../assets/images/mimi/mimiidell_nobg.webm';
import mimiWaveVideo from '../../../assets/images/mimi/mimiwavehand_nobg.webm';
import mimiHappyVideo   from '../../../assets/images/mimi/mimiwavehand_nobg.webm';
import mimiNeutralVideo from '../../../assets/images/mimi/mimiidell_nobg.webm';

import LOG from './logger';
import { WordCard, PictureGuessCard, CountingCard, PatternCard } from './cards/index.jsx';
import { useSpeak }              from './hooks/useSpeak';
import { useFaceDetect }         from './hooks/useFaceDetect';
import { useSpeechRecognition }  from './hooks/useSpeechRecognition';
import { useAudioSpeechRecorder } from './hooks/useAudioSpeechRecorder';
import {
  ACTIVITY_WORDS, shuffleArray, buildQuiz12, normalizeQuestions,
  getWordLabel, getAnswer, stripEmojis, NUM_WORDS,
} from './data/activityWords';
import WORD_EMOJIS from './data/wordEmojis';

/* ── StarRating ───────────────────────────────────────────────── */
function StarRating({ rating, maxStars = 5, size = 'md', animated = false }) {
  const sizes = { sm: 'text-xl', md: 'text-3xl', lg: 'text-4xl' };
  return (
    <div className={`flex gap-1 ${sizes[size] || sizes.md}`}>
      {Array.from({ length: maxStars }, (_, i) => (
        <motion.span key={i}
          animate={animated && i < rating ? { scale: [1, 1.4, 1], rotate: [0, 15, -15, 0] } : {}}
          transition={{ delay: i * 0.12, duration: 0.5 }}
        >
          {i < rating ? '⭐' : '☆'}
        </motion.span>
      ))}
    </div>
  );
}

/* ── ConfettiAnimation ─────────────────────────────────────────── */
function ConfettiAnimation({ duration = 3500, density = 60 }) {
  const pieces = Array.from({ length: density }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: ['#FCD34D','#F472B6','#34D399','#60A5FA','#A78BFA','#FB923C'][i % 6],
    delay: Math.random() * 1.5,
    size: 6 + Math.random() * 8,
  }));
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {pieces.map(p => (
        <motion.div key={p.id}
          className="absolute rounded-sm"
          style={{ left: `${p.x}%`, top: '-10px', width: p.size, height: p.size, background: p.color }}
          animate={{ y: ['0vh', '110vh'], rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)], opacity: [1, 1, 0] }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: 'easeIn' }}
        />
      ))}
    </div>
  );
}

/* ── Constants ────────────────────────────────────────────────── */
const DIFFICULTY_LABELS = { easy: 'Easy', medium: 'Medium', hard: 'Hard' };
const DIFFICULTY_COLORS = {
  easy:   'bg-emerald-400 border-emerald-600 text-white',
  medium: 'bg-amber-400 border-amber-600 text-white',
  hard:   'bg-rose-400 border-rose-600 text-white',
};
const FONT_FREDOKA = { fontFamily: "'Fredoka One', 'Nunito', sans-serif" };

/* ── CameraPreviewCard ─────────────────────────────────────────── */
const CameraPreviewCard = memo(function CameraPreviewCard({
  videoRef, sessionCount, activityName, difficulty,
}) {
  return (
    <motion.div
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.85, opacity: 0 }}
      className="flex flex-col items-center gap-4 max-w-sm w-full"
    >
      <div className="w-full bg-gradient-to-b from-yellow-100 to-amber-50 rounded-[2rem] border-4 border-yellow-400 shadow-2xl overflow-hidden">
        {/* Live camera feed */}
        <div className="relative bg-black rounded-t-[1.75rem] overflow-hidden" style={{ aspectRatio: '4/3' }}>
          <video ref={videoRef} autoPlay muted playsInline
            className="w-full h-full object-cover scale-x-[-1]" />
          {/* Scan overlay */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-3 left-3  w-10 h-10 border-t-4 border-l-4 border-yellow-400 rounded-tl-xl" />
            <div className="absolute top-3 right-3 w-10 h-10 border-t-4 border-r-4 border-yellow-400 rounded-tr-xl" />
            <div className="absolute bottom-3 left-3  w-10 h-10 border-b-4 border-l-4 border-yellow-400 rounded-bl-xl" />
            <div className="absolute bottom-3 right-3 w-10 h-10 border-b-4 border-r-4 border-yellow-400 rounded-br-xl" />
            <motion.div
              className="absolute left-3 right-3 h-1 bg-yellow-400/70 rounded-full"
              animate={{ top: ['10%', '85%', '10%'] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>
        </div>
        {/* Card body */}
        <div className="px-5 py-4 text-center">
          <motion.div animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
            className="text-4xl mb-2">👀</motion.div>
          <h2 className="text-2xl font-black text-yellow-700 mb-1">
            {sessionCount === 0 ? 'Who is first?' : 'Next student, step up!'}
          </h2>
          <p className="text-sm font-semibold text-yellow-600">Look at the camera so I can see you! 😊</p>
          <div className="flex justify-center gap-2 mt-3">
            {[0, 1, 2].map(i => (
              <motion.div key={i} className="w-3 h-3 rounded-full"
                style={{ background: i === 0 ? '#FCD34D' : i === 1 ? '#FB923C' : '#F87171' }}
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.18 }} />
            ))}
          </div>
        </div>
      </div>
      {/* Activity badge */}
      <div className="bg-white/90 rounded-2xl px-6 py-2 border-2 border-yellow-300 shadow text-center">
        <p className="text-xs font-bold text-gray-500">Activity · {DIFFICULTY_LABELS[difficulty]}</p>
        <p className="text-base font-black text-purple-600">{activityName}</p>
        {sessionCount > 0 && (
          <p className="text-xs text-emerald-600 font-semibold mt-0.5">
            ✅ {sessionCount} student{sessionCount > 1 ? 's' : ''} done so far
          </p>
        )}
      </div>
    </motion.div>
  );
});

/* ─────────────────────────────────────────────────────────────
 *  MimiActivityOverlay
 * ───────────────────────────────────────────────────────────── */
function MimiActivityOverlay({ activity, difficulty, onStudentDone, onClose, isParentMode = false, childName = '' }) {
  LOG.render('MimiActivityOverlay', `activityId=${activity.id} difficulty=${difficulty}`);

  /* ── Initial words ─────────────────────────────────────────── */
  const rawStatic   = ACTIVITY_WORDS[activity.id]?.[difficulty] ?? ACTIVITY_WORDS[activity.id]?.easy ?? ['Hello'];
  const staticWords = activity.id === 12
    ? buildQuiz12(difficulty)
    : activity.id >= 9 ? shuffleArray(rawStatic) : rawStatic;

  /* ── State ─────────────────────────────────────────────────── */
  const [words,          setWords]          = useState(staticWords);
  const [loadingQ,       setLoadingQ]       = useState(activity.id >= 9);
  const [phase,          setPhase]          = useState('waiting');
  const [studentName,    setStudentName]    = useState('');
  const [mimiVideo,      setMimiVideo]      = useState(mimiIdleVideo);
  const [current,        setCurrent]        = useState(0);
  const [correct,        setCorrect]        = useState(0);
  const [transcript,     setTranscript]     = useState('');
  const [mimiSaying,     setMimiSaying]     = useState('');
  const [isCorrect,      setIsCorrect]      = useState(null);
  const [starsEarned,    setStarsEarned]    = useState(0);
  const [llmFeedback,    setLlmFeedback]    = useState('');
  const [countdown,      setCountdown]      = useState(5);
  const [sessionResults, setSessionResults] = useState([]);
  const [isPaused,       setIsPaused]       = useState(false);
  const [showEndConfirm, setShowEndConfirm] = useState(false);
  const [sessionEnded,   setSessionEnded]   = useState(false);
  const [showConfetti,   setShowConfetti]   = useState(false);

  /* ── Refs (stable across renders, no re-render on change) ──── */
  const mountedRef       = useRef(true);
  const phaseRef         = useRef('waiting');
  const correctRef       = useRef(0);
  const isPausedRef      = useRef(false);
  const answeredRef      = useRef(false);
  const sessionEndedRef  = useRef(false);
  const seenRef          = useRef(new Set());
  const liveVideoRef     = useRef(null);
  const resultTimerRef   = useRef(null);
  const intentionalStopRef = useRef(false);
  const currentRef       = useRef(0); // mirror of current state for closures
  const wordsRef         = useRef(staticWords); // mirror of words for closures

  useEffect(() => { mountedRef.current = true; return () => { mountedRef.current = false; }; }, []);
  useEffect(() => { phaseRef.current    = phase;    }, [phase]);
  useEffect(() => { correctRef.current  = correct;  }, [correct]);
  useEffect(() => { isPausedRef.current = isPaused; }, [isPaused]);
  useEffect(() => { currentRef.current  = current;  }, [current]);
  useEffect(() => { wordsRef.current    = words;    }, [words]);

  /* ── Hooks ─────────────────────────────────────────────────── */
  const { speak, cancelSpeech, prefetchTTS, clearPrefetch } = useSpeak(mountedRef);

  const { startCameraPoll, stopCamera, resetRecognized, pollRef, cameraStreamRef } =
    useFaceDetect({ mountedRef, phaseRef, liveVideoRef, seenRef });

  const { startRecording, stopRecording, isRecording, isSilence } = useAudioSpeechRecorder();
  const { checkForControlWord } = useSpeechRecognition(); // Keep for command parsing only

  /* ── Derived ───────────────────────────────────────────────── */
  const total       = words.length;
  const currentItem = words[Math.min(current, total - 1)];
  const word        = getWordLabel(currentItem);
  const emoji       = currentItem?._llmEmoji || WORD_EMOJIS[word] || '📖';
  const progress    = ['waiting', 'between_students'].includes(phase) ? 0
    : ((current + (phase === 'done' ? 1 : 0)) / total) * 100;

  /* ── Fetch AI questions (activities 9–12) ──────────────────── */
  useEffect(() => {
    if (activity.id < 9) return;
    let cancelled = false;
    setLoadingQ(true);
    const seed  = Math.random().toString(36).slice(2, 8);
    const count = difficulty === 'hard' ? 8 : 6;
    LOG.info('Questions', 'Fetching from server', { activityId: activity.id, difficulty, count, seed });
    const done = LOG.time('AI question fetch');

    axios.post(API_ENDPOINTS.GENERATE_QUESTIONS, {
      activity_id: activity.id, difficulty, count, session_seed: seed,
    })
      .then(res => {
        done({ count: res.data?.questions?.length });
        if (cancelled || !mountedRef.current) return;
        const qs   = res.data?.questions;
        const norm = normalizeQuestions(activity.id, qs);
        if (norm?.length) {
          setWords(norm);
          wordsRef.current = norm;
          LOG.info('Questions', 'Set words from server', { count: norm.length });
        }
      })
      .catch(e => LOG.error('Questions', 'Fetch failed — using static fallback', e.message))
      .finally(() => { if (!cancelled && mountedRef.current) setLoadingQ(false); });

    return () => { cancelled = true; };
  }, [activity.id, difficulty]); // eslint-disable-line

  /* ── Camera start ──────────────────────────────────────────── */
  useEffect(() => {
    intentionalStopRef.current = false;
    if (!isParentMode) {
      startCameraPoll(name => {
        setStudentName(name);
        setMimiVideo(mimiWaveVideo);
        setPhase('intro');
      });
    }
    return () => {
      clearInterval(pollRef.current);
      cameraStreamRef.current?.getTracks().forEach(t => t.stop());
      setTimeout(() => {
        if (intentionalStopRef.current)
          axios.get(API_ENDPOINTS.STOP_FACE_DETECT).catch(() => {});
      }, 100);
    };
  }, []); // eslint-disable-line

  /* ── Parent mode: advance to intro once questions are ready ── */
  useEffect(() => {
    if (!isParentMode || loadingQ) return;
    const name = childName || 'Student';
    setStudentName(name);
    setMimiVideo(mimiWaveVideo);
    setPhase('intro');
  }, [isParentMode, loadingQ, childName]); // eslint-disable-line

  /* ── Reset for next student ────────────────────────────────── */
  const resetForNextStudent = useCallback(() => {
    LOG.info('Session', 'Resetting for next student');
    setCurrent(0);    currentRef.current = 0;
    setCorrect(0);    correctRef.current = 0;
    setTranscript(''); setLlmFeedback(''); setIsCorrect(null);
    setStarsEarned(0); setStudentName(''); setMimiVideo(mimiIdleVideo);
    answeredRef.current = false;
    seenRef.current.clear();
    resetRecognized();
    clearPrefetch();
    setPhase('waiting');
    if (!isParentMode) {
      startCameraPoll(name => {
        setStudentName(name);
        setMimiVideo(mimiWaveVideo);
        setPhase('intro');
      });
    }
    // In parent mode, the loadingQ useEffect will re-trigger intro
    // if questions need reloading, otherwise set directly
    if (isParentMode) {
      const name = childName || 'Student';
      setStudentName(name);
      setMimiVideo(mimiWaveVideo);
      setPhase('intro');
    }
  }, [startCameraPoll, resetRecognized, clearPrefetch, isParentMode, childName]);

  /* ── voice-stop phase ──────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'voice-stop') return;
    finishStudent(correctRef.current, false, true);
  }, [phase]); // eslint-disable-line

  /* ── between_students countdown ───────────────────────────── */
  useEffect(() => {
    if (isParentMode || phase !== 'between_students') return;
    setCountdown(5);
    const tick = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(tick); resetForNextStudent(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [phase, isParentMode]); // eslint-disable-line

  /* ── Mimi video by phase ───────────────────────────────────── */
  useEffect(() => {
    if (['waiting', 'between_students'].includes(phase)) { setMimiVideo(mimiIdleVideo); return; }
    if (phase === 'done') { setMimiVideo(starsEarned >= 4 ? mimiHappyVideo : mimiNeutralVideo); return; }
    setMimiVideo(mimiWaveVideo);
  }, [phase, starsEarned]);

  /* ── Confetti ──────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'done') { setShowConfetti(false); return; }
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 3500);
    return () => clearTimeout(t);
  }, [phase]);

  /* ════════════════════════════════════════════════════════════
   *  PHASE EFFECTS
   * ════════════════════════════════════════════════════════════ */

  /* ── INTRO ─────────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'intro') return;
    const msg = `Hi ${studentName}! Let's start ${activity.name}!`;
    setMimiSaying(msg);
    LOG.phase('waiting', 'intro', { studentName });

    // Prefetch first question TTS while greeting plays to avoid overlap
    const firstItem = wordsRef.current[0];
    const firstWord = getWordLabel(firstItem);
    let firstMsg = '';
    if      (activity.id === 9)  firstMsg = 'Look carefully\u2026 what do you see?';
    else if (activity.id === 10) firstMsg = firstItem?.addend1 != null ? 'Count them all and tell me the total!' : 'Count the items and tell me how many!';
    else if (activity.id === 11) firstMsg = 'What comes next in the pattern?';
    else                          firstMsg = `Can you say\u2026 ${firstWord}?`;
    prefetchTTS(firstMsg, 'q0');

    // Wait for greeting TTS to fully finish before advancing — prevents overlap
    speak(msg).catch(() => {}).finally(() => {
      if (mountedRef.current) setPhase('asking');
    });
  }, [phase]); // eslint-disable-line

  /* ── ASKING ────────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'asking' || isPausedRef.current) return;
    answeredRef.current = false;

    const item = wordsRef.current[currentRef.current];
    let msg = '';
    if      (activity.id === 9)  msg = 'Look carefully… what do you see?';
    else if (activity.id === 10) msg = item?.addend1 != null ? 'Count them all and tell me the total!' : 'Count the items and tell me how many!';
    else if (activity.id === 11) msg = 'What comes next in the pattern?';
    else                          msg = `Can you say… ${getWordLabel(item)}?`;

    setMimiSaying(msg);
    LOG.phase('result/intro', 'asking', { q: currentRef.current, word: getWordLabel(item) });

    // ── Prefetch next question's TTS right now ─────────────────
    const nextIdx = currentRef.current + 1;
    if (nextIdx < wordsRef.current.length) {
      const nextItem = wordsRef.current[nextIdx];
      const nextWord = getWordLabel(nextItem);
      let nextMsg = '';
      if      (activity.id === 9)  nextMsg = 'Look carefully… what do you see?';
      else if (activity.id === 10) nextMsg = nextItem?.addend1 != null ? 'Count them all and tell me the total!' : 'Count the items and tell me how many!';
      else if (activity.id === 11) nextMsg = 'What comes next in the pattern?';
      else                          nextMsg = `Can you say… ${nextWord}?`;
      prefetchTTS(nextMsg, `q${nextIdx}`);
    }

    let cancelled = false;
    speak(msg).finally(() => {
      if (!cancelled && mountedRef.current) {
        setTimeout(() => { if (!cancelled && mountedRef.current) setPhase('listening'); }, 300);
      }
    });
    const fb = setTimeout(() => { if (!cancelled && mountedRef.current) setPhase('listening'); }, 8000);
    return () => { cancelled = true; clearTimeout(fb); };
  }, [phase, current]); // eslint-disable-line

  /* ── LISTENING ─────────────────────────────────────────────── */
  useEffect(() => {
    if (phase !== 'listening' || isPausedRef.current) return;
    setMimiSaying('I am listening… 👂');

    const item   = wordsRef.current[currentRef.current];
    const answer = getAnswer(item);
    LOG.phase('asking', 'listening', { answer });

    let cancelled = false;
    startRecording(async (blob) => {
      if (cancelled || answeredRef.current) return;
      
      const silent = await isSilence(blob);
      if (silent) {
        LOG.info('SR', 'Silence detected — treating as no answer');
        if (!answeredRef.current) { answeredRef.current = true; sendAudioToBackend(null, answer); }
        return;
      }

      if (!answeredRef.current) {
        answeredRef.current = true;
        sendAudioToBackend(blob, answer);
      }
    }).catch(e => {
        LOG.error('SR', 'Mic start failed', e.message);
        if (!answeredRef.current) { answeredRef.current = true; sendAudioToBackend(null, answer); }
    });

    return () => { cancelled = true; stopRecording(); };
  }, [phase, current]); // eslint-disable-line

  /* ════════════════════════════════════════════════════════════
   *  GRADING
   * ════════════════════════════════════════════════════════════ */

  function checkAnswerLocally(word, childSaid) {
    const heard    = (childSaid || '').trim().replace(/[.!?,;]+$/, '').toLowerCase();
    if (!heard) return false;
    const expected = word.toLowerCase();
    // Direct match or substring
    if (heard.includes(expected) || expected.includes(heard)) return true;
    // Number word equivalence
    const wfe = Object.keys(NUM_WORDS).find(k => NUM_WORDS[k] === expected);
    if (wfe && heard.includes(wfe)) return true;
    if (NUM_WORDS[expected] && heard.includes(NUM_WORDS[expected])) return true;
    // Fuzzy: allow 1-char difference for short words (handles accent/SR drift)
    if (expected.length >= 3) {
      let diff = 0;
      const a = heard.slice(0, expected.length);
      for (let i = 0; i < expected.length; i++) if (a[i] !== expected[i]) diff++;
      if (diff <= 1) return true;
    }
    return false;
  }

  async function sendAudioToBackend(blob, word) {
    setPhase('checking');
    setMimiSaying('Mimi is thinking… 🧠');
    
    const buildMsg = (ok, raw) => stripEmojis(
      raw ?? (ok ? `Wonderful! ${word} is correct!` : `Never mind! The answer was ${word}! Keep trying!`)
    );
    const prefetchFeedback = (msg) => prefetchTTS(msg, 'feedback');

    if (!blob) {
      const msg = buildMsg(false, `Oops! Nothing heard. The answer was ${word}! Try next time!`);
      prefetchFeedback(msg);
      setLlmFeedback(msg); handleResult(false, msg); return;
    }

    const t0 = Date.now();
    LOG.info('SR', 'Sending audio to backend', { word, blobSize: blob.size });

    try {
      const formData = new FormData();
      formData.append('audio', blob, 'activity_answer.webm');
      formData.append('word', word);
      formData.append('activity_name', activity.name);
      formData.append('student_name', studentName);

      const res = await axios.post(API_ENDPOINTS.ACTIVITY_CHECK_AUDIO, formData);
      LOG.info('SR', 'Backend response', { ms: Date.now() - t0, status: res.data?.status });

      if (res.data?.status === 'nothing_heard') {
        const msg = buildMsg(false, `Oops! Nothing heard. The answer was ${word}! Try next time!`);
        prefetchFeedback(msg);
        setLlmFeedback(msg); handleResult(false, msg); return;
      }

      const heard = res.data?.detected_text || '';
      setTranscript(heard);
      
      const cmd = checkForControlWord(heard);
      if (cmd) { handleControlCommand(cmd); return; }

      const r   = res.data?.result;
      const ok  = r?.correct === true || checkAnswerLocally(word, heard);
      const msg = buildMsg(ok, r?.feedback);
      prefetchFeedback(msg);
      setLlmFeedback(msg); handleResult(ok, msg);
    } catch (e) {
      LOG.error('SR', 'Backend call failed', e.message);
      const msg = buildMsg(false);
      prefetchFeedback(msg);
      setLlmFeedback(msg); handleResult(false, msg);
    }
  }

  async function handleResult(ok, feedback) {
    LOG.info('Result', ok ? '✅ CORRECT' : '❌ WRONG', { feedback });
    const nc = correctRef.current + (ok ? 1 : 0);
    if (ok) { setCorrect(nc); correctRef.current = nc; }
    setIsCorrect(ok);
    setMimiSaying(feedback);
    setPhase('result');
    clearTimeout(resultTimerRef.current);

    try { await speak(feedback); } catch (e) { LOG.warn('Result', 'speak error', e.message); }

    if (sessionEndedRef.current) return;
    if (currentRef.current + 1 < total) {
      setCurrent(c => c + 1);
      setIsCorrect(null); setTranscript(''); setLlmFeedback('');
      setPhase('asking');
    } else {
      finishStudent(nc);
    }
  }

  function finishStudent(fc, isEarly = false, skipTransition = false) {
    LOG.info('Student', 'Finished', { name: studentName, correct: fc, total, isEarly });
    const score  = Math.round((fc / total) * 100);
    const earned = fc === 0 ? 0 : Math.min(5, Math.max(1, Math.round((fc / total) * 5)));
    setStarsEarned(earned);
    setPhase('done');

    const spokenMsg  = earned === 0
      ? `Good try ${studentName}! Keep practicing!`
      : `Well done ${studentName}! You earned ${earned} star${earned !== 1 ? 's' : ''}!`;
    const displayMsg = earned === 0
      ? `Good try ${studentName}! Keep practicing! 💪`
      : `Well done ${studentName}! You earned ${earned} star${earned !== 1 ? 's' : ''}! 🎉`;

    setMimiSaying(displayMsg);
    if (!skipTransition) speak(spokenMsg).catch(() => {});

    seenRef.current.add(studentName.toLowerCase());
    onStudentDone({ stars: earned, score, correct: fc, total, studentName });
    setSessionResults(prev => [...prev, { name: studentName, stars: earned, score, correct: fc, total }]);

    if (!isEarly && !skipTransition) {
      if (isParentMode) {
        setTimeout(() => { sessionEndedRef.current = true; setSessionEnded(true); }, 4500);
      } else {
        setTimeout(() => setPhase('between_students'), 4500);
      }
    }
  }

  /* ════════════════════════════════════════════════════════════
   *  VOICE CONTROL COMMANDS
   * ════════════════════════════════════════════════════════════ */

  const handleControlCommand = useCallback((cmd) => {
    LOG.info('VoiceCmd', 'Command received', cmd);
    if (cmd === 'pause') {
      if (isPausedRef.current) return;
      cancelSpeech();
      clearTimeout(resultTimerRef.current);
      isPausedRef.current = true; setIsPaused(true); setListening(false);
      setMimiSaying('⏸️ Activity paused. Say "Resume Alexi" to continue.');
      setMimiVideo(mimiIdleVideo);
    } else if (cmd === 'resume') {
      if (!isPausedRef.current) return;
      isPausedRef.current = false; setIsPaused(false);
      setMimiVideo(mimiWaveVideo); setPhase('asking');
    } else if (cmd === 'stop') {
      if (sessionEndedRef.current) return;
      cancelSpeech();
      clearTimeout(resultTimerRef.current);
      clearInterval(pollRef.current);
      isPausedRef.current = true; setIsPaused(true); setListening(false);
      setPhase('voice-stop');
    }
  }, [cancelSpeech, pollRef]);

  /* ════════════════════════════════════════════════════════════
   *  UI CONTROLS
   * ════════════════════════════════════════════════════════════ */

  function handlePause() {
    if (isPausedRef.current) return;
    LOG.info('UI', 'Pause button pressed');
    cancelSpeech(); clearTimeout(resultTimerRef.current);
    isPausedRef.current = true; setIsPaused(true);
    setMimiSaying('⏸️ Activity paused'); setMimiVideo(mimiIdleVideo);
  }

  function handleResume() {
    LOG.info('UI', 'Resume button pressed');
    isPausedRef.current = false; setIsPaused(false);
    setMimiVideo(mimiWaveVideo);
    setPhase('idle_resume');
    setTimeout(() => setPhase('asking'), 50);
  }

  function handleEndClick() {
    LOG.info('UI', 'End Session clicked');
    cancelSpeech(); clearTimeout(resultTimerRef.current); clearInterval(pollRef.current);
    stopCamera();
    isPausedRef.current = true; setIsPaused(true); setListening(false);
    setMimiVideo(mimiIdleVideo); setMimiSaying('⏸️ Activity paused');
    setShowEndConfirm(true);
  }

  function handleEndSession() {
    LOG.info('Session', 'End confirmed by teacher');
    setShowEndConfirm(false);
    sessionEndedRef.current = true; isPausedRef.current = false;
    clearInterval(pollRef.current); clearTimeout(resultTimerRef.current);
    cancelSpeech(); stopCamera(); clearPrefetch();
    intentionalStopRef.current = true;
    axios.get(API_ENDPOINTS.STOP_FACE_DETECT).catch(() => {});
    if (studentName) speak(`Well done ${studentName}!`);
    if (studentName && !['waiting', 'between_students', 'done'].includes(phaseRef.current))
      finishStudent(correctRef.current, true, true);
    setSessionEnded(true);
  }

  function handleCancelEnd() { setShowEndConfirm(false); handleResume(); }

  /* ── Space-bar shortcut ────────────────────────────────────── */
  useEffect(() => {
    const onKey = e => {
      if (e.code !== 'Space') return;
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      e.preventDefault();
      if (sessionEnded || ['waiting', 'between_students', 'done'].includes(phase)) return;
      if (isPaused) handleResume(); else handlePause();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isPaused, phase, sessionEnded]); // eslint-disable-line

  /* ════════════════════════════════════════════════════════════
   *  RENDER WORD CARD
   * ════════════════════════════════════════════════════════════ */
  function renderWordCard() {
    const shared = { mimiSaying, phase, listening: isRecording, transcript };

    if (activity.id === 9)
      return <PictureGuessCard emoji={currentItem?._llmEmoji || WORD_EMOJIS[word] || '🖼️'} {...shared} />;

    if (activity.id === 10)
      return <CountingCard item={currentItem} {...shared} />;

    if (activity.id === 11)
      return <PatternCard item={currentItem} {...shared} />;

    if (activity.id === 12) {
      const sb = currentItem?._source || null;
      if (currentItem?.pattern)   return <PatternCard item={currentItem} {...shared} />;
      if (currentItem?.display)   return <CountingCard item={currentItem} {...shared} />;
      if (currentItem?._llmEmoji) return <PictureGuessCard emoji={currentItem._llmEmoji} {...shared} />;
      if (currentItem?._word)
        return <WordCard word={currentItem._word} emoji={WORD_EMOJIS[currentItem._word] || '📖'}
          current={current} total={total} sourceBadge={sb} {...shared} />;
    }

    return (
      <WordCard word={word} emoji={emoji}
        current={current} total={total} sourceBadge={null} {...shared} />
    );
  }

  /* ════════════════════════════════════════════════════════════
   *  LOADING SCREEN
   * ════════════════════════════════════════════════════════════ */
  if (loadingQ) return (
    <div className="fixed inset-0 z-50 bg-cover bg-center flex items-center justify-center px-4"
         style={{ backgroundImage: `url(${bgImage})` }}>
      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-[2rem] px-8 py-10 shadow-2xl border-4 border-yellow-300 text-center max-w-md w-full">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="text-7xl mb-4 inline-block">🧠</motion.div>
        <h2 className="text-3xl font-black text-purple-700 mb-2" style={FONT_FREDOKA}>
          Mimi is preparing…
        </h2>
        <p className="text-purple-500 text-lg mb-1">
          Creating fresh <strong>{DIFFICULTY_LABELS[difficulty]}</strong> questions!
        </p>
        <p className="text-gray-400 text-sm mb-4">{activity.name}</p>
        <div className="flex justify-center gap-2 mt-2">
          {[0, 1, 2].map(i => (
            <motion.div key={i} animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
              className="w-4 h-4 rounded-full"
              style={{ background: i === 0 ? '#A78BFA' : i === 1 ? '#F472B6' : '#34D399' }} />
          ))}
        </div>
      </motion.div>
    </div>
  );

  /* ════════════════════════════════════════════════════════════
   *  MAIN RENDER
   * ════════════════════════════════════════════════════════════ */
  return (
    <div className="fixed inset-0 z-50 bg-cover bg-center overflow-hidden"
         style={{ backgroundImage: `url(${bgImage})`, fontFamily: "'Nunito','Fredoka One',sans-serif" }}>

      {/* Difficulty badge — bottom-right so it never overlaps the student name at top */}
      <div className="absolute bottom-4 right-4 z-50">
        <span className={`px-3 py-1.5 rounded-full text-xs font-black border-2 ${DIFFICULTY_COLORS[difficulty]}`}>
          {DIFFICULTY_LABELS[difficulty]}
        </span>
      </div>

      {/* Progress bar */}
      {!['waiting', 'between_students'].includes(phase) && (
        <div className="absolute top-0 left-0 right-0 h-3 bg-white/20 z-40 overflow-hidden">
          <motion.div className="h-full bg-gradient-to-r from-yellow-300 to-pink-400 rounded-full"
            animate={{ width: `${progress}%` }} transition={{ duration: 0.4 }} />
        </div>
      )}

      {/* End confirm dialog */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/60 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }}
              className="bg-white rounded-[2rem] px-8 py-8 shadow-2xl border-4 border-red-300 text-center max-w-sm w-full">
              <div className="text-5xl mb-3">⚠️</div>
              <h2 className="text-2xl font-black text-red-600 mb-2">End Activity?</h2>
              <p className="text-gray-500 mb-6 text-sm">Progress will be saved for all students done so far.</p>
              <div className="flex gap-3 justify-center">
                <button onClick={handleEndSession}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl shadow-lg transition-all">
                  Yes, End
                </button>
                <button onClick={handleCancelEnd}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-black rounded-2xl transition-all">
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session ended summary */}
      <AnimatePresence>
        {sessionEnded && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-40 bg-black/70 flex items-center justify-center px-4">
            <motion.div initial={{ scale: 0.8, y: 40 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.8 }}
              className="bg-white rounded-[2rem] px-6 py-8 shadow-2xl border-4 border-yellow-300 max-w-lg w-full max-h-[85vh] overflow-y-auto">
              <div className="text-center mb-6">
                <div className="text-6xl mb-2">🏆</div>
                <h2 className="text-3xl font-black text-purple-700" style={FONT_FREDOKA}>Activity Complete!</h2>
                <p className="text-gray-400 text-sm mt-1">{activity.name} · {DIFFICULTY_LABELS[difficulty]}</p>
              </div>
              {sessionResults.length === 0 ? (
                <p className="text-center text-gray-400 py-4">No students completed any questions.</p>
              ) : (
                <div className="space-y-3 mb-6">
                  {sessionResults.map((r, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-purple-500">#{i + 1}</span>
                        <div>
                          <p className="font-black text-gray-800">{r.name}</p>
                          <p className="text-xs text-gray-400">{r.correct}/{r.total} correct · {r.score}%</p>
                        </div>
                      </div>
                      <StarRating rating={r.stars} maxStars={5} size="md" showNumber={false} animated={false} />
                    </motion.div>
                  ))}
                </div>
              )}
              <div className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-200 text-center">
                <p className="text-blue-700 text-sm font-bold">⭐ Stars saved to Students tab & Parent portal</p>
              </div>
              <button onClick={() => { clearInterval(pollRef.current); onClose(); }}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-black text-lg rounded-2xl shadow-lg transition-all">
                Close 🎈
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Student name banner */}
      <AnimatePresence>
        {studentName && !['waiting', 'between_students'].includes(phase) && (
          <motion.div initial={{ opacity: 0, y: -30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }}
            className="absolute top-3 left-1/2 -translate-x-1/2 z-40 max-w-[70vw]">
            <div className="bg-white/95 backdrop-blur px-4 py-1.5 rounded-2xl border-2 border-purple-400 shadow-xl">
              <h2 className="text-base sm:text-xl font-black text-purple-700 text-center truncate" style={FONT_FREDOKA}>
                Hi {studentName}! 👋
              </h2>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Scoreboard */}
      {sessionResults.length > 0 && !['waiting', 'between_students'].includes(phase) && (
        <div className="hidden sm:block absolute top-16 left-4 z-40 bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl border-2 border-yellow-300 min-w-[200px]">
          <p className="text-sm font-black text-purple-700 mb-2">📊 Scoreboard</p>
          {sessionResults.map((r, i) => (
            <div key={i} className="flex items-center justify-between gap-2 py-1 border-b border-purple-100 last:border-0">
              <span className="text-sm font-bold text-gray-700 truncate max-w-[110px]">{r.name}</span>
              <span className="text-xs text-gray-500">{r.score}%</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Main content ─────────────────────────────────────── */}
      {/* pb-36 keeps content above bottom controls on mobile; sm+ shifts left of Mimi */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-20 px-4 pb-36 sm:pb-4 sm:pr-[38%] lg:pr-[45%]">
        <AnimatePresence mode="wait">

          {phase === 'waiting' && (
            <motion.div key="waiting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <CameraPreviewCard videoRef={liveVideoRef} sessionCount={sessionResults.length}
                activityName={activity.name} difficulty={difficulty} />
            </motion.div>
          )}

          {phase === 'between_students' && (
            <motion.div key="between" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-white rounded-[2rem] px-6 py-8 shadow-2xl border-4 border-yellow-300 max-w-md w-full">
              <h2 className="text-2xl font-black text-purple-700 text-center mb-4" style={FONT_FREDOKA}>
                🏆 Results So Far
              </h2>
              <div className="space-y-2 mb-6">
                {sessionResults.map((r, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-black text-purple-600">#{i + 1}</span>
                      <span className="font-black text-gray-800">{r.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={r.stars} maxStars={5} size="sm" showNumber={false} animated={false} />
                      <span className="text-sm font-bold text-gray-600">{r.correct}/{r.total}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
              <div className="text-center">
                <p className="text-purple-500 font-bold mb-1">Next student in…</p>
                <motion.div key={countdown} initial={{ scale: 1.5 }} animate={{ scale: 1 }}
                  className="text-6xl font-black text-purple-700" style={FONT_FREDOKA}>
                  {countdown}
                </motion.div>
              </div>
            </motion.div>
          )}

          {phase === 'intro' && (
            <motion.div key="intro" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-white rounded-[2rem] px-8 py-8 shadow-2xl border-4 border-yellow-300 text-center max-w-md w-full">
              <div className="text-6xl mb-3">🌟</div>
              <h2 className="text-4xl font-black text-purple-700 mb-2" style={FONT_FREDOKA}>{activity.name}</h2>
              <p className="text-lg font-bold text-purple-500">{mimiSaying}</p>
            </motion.div>
          )}

          {['asking', 'listening'].includes(phase) && (
            <motion.div key={`q-${current}`} initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }}>
              {renderWordCard()}
            </motion.div>
          )}

          {phase === 'checking' && (
            <motion.div key="checking" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-white rounded-[2rem] px-8 py-8 shadow-2xl border-4 border-purple-300 text-center max-w-sm w-full">
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                className="text-6xl mb-3 inline-block">🧠</motion.div>
              <h2 className="text-2xl font-black text-purple-700" style={FONT_FREDOKA}>Mimi is thinking…</h2>
            </motion.div>
          )}

          {phase === 'result' && (
            <motion.div key="result" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-white rounded-[2rem] px-6 py-7 shadow-2xl border-4 border-purple-300 text-center max-w-sm w-full">
              <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 0.5 }}
                className="text-6xl mb-2">{isCorrect ? '🎉' : '💪'}</motion.div>
              <h2 className={`text-4xl font-black mb-3 ${isCorrect ? 'text-emerald-600' : 'text-orange-500'}`}
                  style={FONT_FREDOKA}>
                {isCorrect ? 'Correct!' : 'Keep Trying!'}
              </h2>
              <div className="bg-purple-50 rounded-2xl p-3 mb-2 border border-purple-200">
                <p className="text-purple-700 text-base font-bold">{llmFeedback}</p>
              </div>
              {transcript && <p className="text-xs text-gray-400">Said: "{transcript}"</p>}
            </motion.div>
          )}

          {phase === 'done' && (
            <motion.div key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
              className="bg-gradient-to-b from-yellow-50 to-white rounded-[2rem] px-8 py-8 shadow-2xl border-4 border-yellow-400 text-center max-w-sm w-full">
              <motion.div animate={{ rotate: [-5, 5, -5] }} transition={{ duration: 0.5, repeat: 3 }}
                className="text-6xl mb-2">🏆</motion.div>
              <h2 className="text-4xl font-black text-yellow-600 mb-2" style={FONT_FREDOKA}>
                {correct}/{total} Correct!
              </h2>
              <div className="flex justify-center gap-1 mb-3">
                <StarRating rating={starsEarned} maxStars={5} size="lg" showNumber={false} animated />
              </div>
              <p className="text-xl font-black text-purple-700 mb-1" style={FONT_FREDOKA}>
                {starsEarned} Star{starsEarned !== 1 ? 's' : ''} for {studentName}!
              </p>
              <p className="text-purple-400 text-sm font-semibold">Next student coming up…</p>
              {showConfetti && <ConfettiAnimation duration={3500} density={60} />}
            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* Bottom controls — sits ABOVE Mimi, left-aligned so it never overlaps */}
      {!sessionEnded && (
        <div className="absolute bottom-4 left-4 z-40 flex items-center gap-2">
          {studentName && !['waiting', 'between_students', 'done'].includes(phase) && (
            isPaused ? (
              <motion.button onClick={handleResume} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-sm rounded-2xl shadow-xl border-4 border-emerald-700 transition-colors">
                ▶ Resume
              </motion.button>
            ) : (
              <motion.button onClick={handlePause} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-4 py-2.5 bg-amber-400 hover:bg-amber-500 text-white font-black text-sm rounded-2xl shadow-xl border-4 border-amber-600 transition-colors">
                ⏸ Pause
              </motion.button>
            )
          )}
          <motion.button onClick={handleEndClick} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black text-sm rounded-2xl shadow-xl border-4 border-rose-700 transition-colors">
            ⏹ End
          </motion.button>
        </div>
      )}

      {/* Mimi character — right side, never overlaps left-aligned controls */}
      <div className="absolute bottom-0 right-0 sm:right-[2%] z-10 pointer-events-none">
        <motion.div key={mimiVideo} initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 18, stiffness: 120 }}
          className="w-36 h-36 sm:w-64 sm:h-64 lg:w-[460px] lg:h-[460px]">
          <video key={mimiVideo} src={mimiVideo} autoPlay loop muted playsInline
            className="w-full h-full object-contain" style={{ background: 'transparent' }} />
        </motion.div>
      </div>
    </div>
  );
}

export default memo(MimiActivityOverlay);
