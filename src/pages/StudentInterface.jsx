import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { API_ENDPOINTS } from '../config';

// import bgImage from '../assets/images/mimi/bg.jpg';
import useMimiCustomizer from '../hooks/UseMimiCustomizer';
import MimiCustomizer from '../components/mimi/MimiCustomizer';

import mimiIdleVideo    from '../assets/images/mimi/mimiidell_nobg.webm';
import mimiWaveVideo    from '../assets/images/mimi/mimiwavehand_nobg.webm';
import mimiNeutralVideo from '../assets/images/mimi/mimiidell_nobg.webm';
import mimiSadVideo     from '../assets/images/mimi/A Big Smile for a Happy Day.mp4';
import mimiHappyVideo   from '../assets/images/mimi/A Fantastic Day of Fun and Laughter.mp4';

const StudentInterface = () => {
  // ── Core state ──────────────────────────────────────────────────────────────
  const [systemStatus, setSystemStatus]   = useState('idle');
  // idle | watching | recognized | talking | completed
  const [personName, setPersonName]       = useState('');
  const [mood, setMood]                   = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [showWarning, setShowWarning]     = useState(false);
  const { currentBgStyle } = useMimiCustomizer();
  const [warningMessage, setWarningMessage] = useState('');

  // Keep refs to avoid stale closure issues inside setInterval
  const systemStatusRef = useRef(systemStatus);
  const moodRef         = useRef(mood);
  useEffect(() => { systemStatusRef.current = systemStatus; }, [systemStatus]);
  useEffect(() => { moodRef.current = mood; }, [mood]);

  // ── Polling ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    let interval;

    if (['watching', 'recognized', 'talking'].includes(systemStatus)) {
      interval = setInterval(async () => {
        try {
          const res = await axios.get(API_ENDPOINTS.GET_STATUS);
          console.log('Backend:', res.data);
          handleBackendResponse(res.data);
        } catch (err) {
          console.error('Backend connection error:', err);
          setStatusMessage('⚠️ Connection lost. Check Flask server.');
        }
      }, 250);  // FIX: Reduced from 500ms to 250ms (4x per second) for real-time feel
    }

    return () => clearInterval(interval);
  }, [systemStatus]); // eslint-disable-line

  // ── Handle backend payload ──────────────────────────────────────────────────
  const handleBackendResponse = (data) => {
    const status = systemStatusRef.current;
    const currentMood = moodRef.current;

    // Warning: too close
    if (data.warning === 'too_close') {
      triggerWarning('⚠️ Too Close! Please step back to mark attendance');
      return;
    }

    // Warning: unknown
    if (data.warning === 'unknown') {
      triggerWarning('❓ Face not recognized. Please register first.');
      return;
    }

    // FIX: Handle "already marked" FIRST and return to prevent conflicting states
    if (data.message === 'already_marked') {
      setStatusMessage('✅ Attendance already marked today!');
      setSystemStatus('completed');
      setTimeout(() => resetState(), 2500);  // ← Quick reset to avoid overlapping messages
      return;  // ← IMPORTANT: Stop processing other states
    }

    // Person recognized → show wave + greeting card
    if (data.person && !['recognized', 'talking', 'completed'].includes(status)) {
      setPersonName(data.person);
      setSystemStatus('recognized');
      // ← Let the personName card show automatically, no status message needed yet
    }

    // FIX: Handle "speaking" action — shows text immediately when Mimi starts talking
    if (data.action === 'speaking' && ['recognized', 'talking'].includes(status)) {
      setSystemStatus('talking');
      setStatusMessage('Mimi is speaking… 🗣️');
    }

    // FIX: Handle "listening" action — updates text when Mimi is listening
    // Only show if NOT already marked (avoid "Listening" + "Already marked" overlap)
    if (data.action === 'listening' && status === 'recognized') {
      setSystemStatus('talking');
      setStatusMessage('Listening to you… 🎤');
    }

    // Mood detected → complete
    if (data.mood && data.mood !== 'null' && data.mood !== '' && data.mood !== currentMood) {
      setMood(data.mood);
      setStatusMessage(`You seem ${data.mood} today! ${getMoodEmoji(data.mood)}`);

      setTimeout(() => {
        setSystemStatus('completed');
        setStatusMessage('Attendance marked! Have a great day! ✨');
      }, 2000);

      setTimeout(() => resetState(), 5000);
    }
  };

  const triggerWarning = (msg) => {
    setWarningMessage(msg);
    setShowWarning(true);
    setTimeout(() => setShowWarning(false), 3000);
  };

  // ── Start session ────────────────────────────────────────────────────────────
  const startSession = async () => {
    setSystemStatus('watching');
    setStatusMessage('Mimi is watching… 👀');
    setPersonName('');
    setMood('');

    try {
      await axios.get(API_ENDPOINTS.START_CLASSROOM);
      console.log('Session started');
    } catch (err) {
      console.error('Failed to start session:', err);
      setStatusMessage('⚠️ Backend not responding. Check Flask server.');
      setSystemStatus('idle');
    }
  };

  // ── Reset ────────────────────────────────────────────────────────────────────
  const resetState = () => {
    setSystemStatus('idle');
    setPersonName('');
    setMood('');
    setStatusMessage('');
    setShowWarning(false);
    setWarningMessage('');
  };

  // ── Video selection ──────────────────────────────────────────────────────────
  // FIX: Show waving video whenever a person has been recognised AND conversation
  //      is ongoing (recognized OR talking states). Only switch to mood video
  //      after mood is confirmed and status is 'completed'.
  const getMimiVideo = () => {
    if (systemStatus === 'completed' && mood) {
      switch (mood.toLowerCase()) {
        case 'happy':   return mimiHappyVideo;
        case 'sad':     return mimiSadVideo;
        default:        return mimiNeutralVideo;
      }
    }

    if (systemStatus === 'recognized' || systemStatus === 'talking') {
      return mimiWaveVideo; // waving the whole time we're interacting
    }

    return mimiIdleVideo;
  };

  // ── Helpers ──────────────────────────────────────────────────────────────────
  const getMoodEmoji = (m) => {
    switch (m?.toLowerCase()) {
      case 'happy':   return '😊';
      case 'sad':     return '😢';
      case 'neutral': return '😐';
      default:        return '';
    }
  };

  const getStatusColor = () => {
    switch (systemStatus) {
      case 'watching':   return 'text-blue-600';
      case 'recognized': return 'text-green-600';
      case 'talking':    return 'text-purple-600';
      case 'completed':  return 'text-green-600';
      default:           return 'text-gray-600';
    }
  };

  const dotColor = () => {
    switch (systemStatus) {
      case 'watching':   return 'bg-blue-500';
      case 'recognized': return 'bg-green-500';
      case 'talking':    return 'bg-purple-500';
      case 'completed':  return 'bg-green-500';
      default:           return 'bg-gray-500';
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center overflow-hidden"
      // style={{ backgroundImage: `url(${bgImage})` }}
      style={{ backgroundImage: currentBgStyle, backgroundSize: 'cover', backgroundPosition: 'center' }}

    >
      {/* ── Wake-up button ── */}
      <div className="absolute top-8 right-8 z-50">
        <motion.button
          onClick={startSession}
          disabled={systemStatus !== 'idle'}
          whileHover={{ scale: systemStatus === 'idle' ? 1.05 : 1 }}
          whileTap={{ scale: systemStatus === 'idle' ? 0.95 : 1 }}
          className={`
            ${systemStatus === 'idle'
              ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-2xl'
              : 'bg-gray-400 cursor-not-allowed shadow-lg'}
            text-white px-8 py-4 rounded-full font-bold text-xl
            transition-all transform flex items-center gap-3
          `}
        >
          {systemStatus === 'idle' ? (
            <>
              <span className="text-3xl">☀️</span>
              <span>Wake Up Mimi</span>
            </>
          ) : (
            <>
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 1 }}
              >
                ●
              </motion.span>
              <span>Mimi is Active</span>
            </>
          )}
        </motion.button>
      </div>

      {/* ── Warning banner (too close / unknown) ── */}
      <AnimatePresence>
        {showWarning && (
          <motion.div
            key="warning"
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            className="absolute top-32 left-1/2 -translate-x-1/2 z-50"
          >
            <div className="bg-red-500 text-white px-8 py-4 rounded-3xl border-4 border-red-700 shadow-2xl">
              <p className="text-2xl font-black text-center">{warningMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Person recognised card ── */}
      <AnimatePresence>
        {personName && !showWarning && (
          <motion.div
            key={`person-${personName}`}
            initial={{ opacity: 0, y: -30, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ type: 'spring', duration: 0.6 }}
            className="absolute top-8 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-white/95 backdrop-blur-lg px-10 py-4 rounded-3xl border-4 border-purple-400 shadow-2xl">
              <h2 className="text-4xl font-black text-purple-700 text-center">
                Hi {personName}! 👋
              </h2>
              {mood && mood !== 'Unknown' && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-bold text-purple-500 uppercase mt-2 text-center"
                >
                  You look {mood} today! {getMoodEmoji(mood)}
                </motion.p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Listening indicator (shown only during listening, not speaking) ── */}
      <AnimatePresence>
        {systemStatus === 'talking' && statusMessage.includes('Listening') && (
          <motion.div
            key="listening"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute top-36 left-1/2 -translate-x-1/2 z-40"
          >
            <div className="bg-purple-600/90 backdrop-blur px-6 py-3 rounded-2xl shadow-lg flex items-center gap-3">
              <motion.span
                className="text-2xl"
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 0.8 }}
              >
                🎤
              </motion.span>
              <span className="text-white font-bold text-lg">Listening…</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Status message (top-left) ── */}
      {statusMessage && (
        <motion.div
          key={statusMessage}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="absolute top-8 left-8 z-40"
        >
          <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-2xl shadow-lg border-2 border-pink-300">
            <p className={`text-lg font-bold ${getStatusColor()}`}>
              {statusMessage}
            </p>
          </div>
        </motion.div>
      )}

      {/* ── System status pill (bottom-left) ── */}
      {systemStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-8 left-8 z-40"
        >
          <div className="bg-black/80 backdrop-blur px-6 py-3 rounded-2xl">
            <div className="flex items-center gap-3">
              <motion.div
                className={`w-3 h-3 rounded-full ${dotColor()}`}
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ repeat: Infinity, duration: 1.5 }}
              />
              <span className="text-white font-bold capitalize">{systemStatus}</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Mimi video (bottom-centre) ── */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-30">
        <motion.div
          key={getMimiVideo()}  /* re-animate whenever video source changes */
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 12, stiffness: 100 }}
          className="w-[600px] h-[600px]"
        >
          <video
            key={getMimiVideo()}
            src={getMimiVideo()}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-contain"
          />
        </motion.div>
      </div>
      <MimiCustomizer />
      {/* ── Decorative elements ── */}
      {/* <AnimatePresence>
        {systemStatus !== 'idle' && (
          <>
            <motion.div
              key="star"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, rotate: 360 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute top-[20%] left-[10%] text-6xl pointer-events-none"
            >
              ⭐
            </motion.div>

            <motion.div
              key="cloud"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1, y: [0, -15, 0] }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 0.6, y: { repeat: Infinity, duration: 3 } }}
              className="absolute top-[30%] right-[15%] text-5xl pointer-events-none"
            >
              ☁️
            </motion.div>
          </>
        )}
      </AnimatePresence> */}
    </div>
  );
};

export default StudentInterface;