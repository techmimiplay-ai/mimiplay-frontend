/**
 * MimiChat — Soft pastel AI tutor for ages 4–5
 * Design: gentle dreamworld — think Bluey / Peppa Pig aesthetic
 * Subtle, soothing, continuously watchable. Not arcade-loud.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { API_ENDPOINTS } from '../config'

// import bgImage       from '../assets/images/mimi/bg.jpg'
import useMimiCustomizer from '../hooks/useMimiCustomizer'
import MimiCustomizer from '../components/mimi/MimiCustomizer'
import MimiCharacter from '../components/mimi/MimiCharacter'
// import mimiVideo from '../assets/images/mimi/mimiwavehand_nobg.webm'

// ─────────────────────────────────────────────────────────────────────────────
// Logging — dev only, silent in production
// ─────────────────────────────────────────────────────────────────────────────
const log = import.meta.env.DEV
  ? (area, msg, data) => {
    const ts = new Date().toISOString().slice(11, 23)
    if (data !== undefined) console.log(`[${ts}] [${area}] ${msg}`, data)
    else console.log(`[${ts}] [${area}] ${msg}`)
  }
  : () => { }

// ─────────────────────────────────────────────────────────────────────────────
// Keyword helpers
// ─────────────────────────────────────────────────────────────────────────────
const clean = (t) => (t || '').toLowerCase().replace(/[^a-z\s]/g, '').trim()

const checkForWakeWord = (t) => {
  const l = clean(t)
  return ['hey alexi', 'hey alexa', 'hi alexi', 'hi alexa', 'hello alexi', 'hello alexa',
    'okay alexi', 'ok alexi', 'okay alexa', 'ok alexa'].some(w => l.includes(w))
}
const checkForByeWord = (t) => {
  const l = clean(t)
  return ['bye alexi', 'bye alexa', 'goodbye alexi', 'goodbye alexa', 'stop alexi',
    'stop alexa', 'alexi stop', 'alexa stop', 'exit alexi', 'exit alexa'].some(w => l.includes(w))
}
const checkForPlayVideoCommand = (t) => {
  const l = clean(t)
  return ['alexi play video', 'alexa play video', 'alexi play the video',
    'alexa play the video', 'play the video', 'play video'].some(w => l.includes(w))
}

const getYtEmbedUrl = (url) => {
  if (!url) return null
  if (url.includes('/embed/')) return url
  const m = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return m ? `https://www.youtube.com/embed/${m[1]}` : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Soft floating sparkle — barely visible, gentle drift
// ─────────────────────────────────────────────────────────────────────────────
const Sparkle = ({ emoji, style, duration = 4 }) => (
  <motion.div
    animate={{ y: [0, -14, 0], opacity: [0.55, 0.85, 0.55] }}
    transition={{ duration, repeat: Infinity, ease: 'easeInOut' }}
    style={{
      position: 'absolute', fontSize: 22,
      userSelect: 'none', pointerEvents: 'none',
      filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.08))',
      ...style,
    }}
  >
    {emoji}
  </motion.div>
)

// ─────────────────────────────────────────────────────────────────────────────
// Silence detection — checks if audio blob is just background noise
// Returns true if the audio is too quiet to be real speech
// ─────────────────────────────────────────────────────────────────────────────
const isSilence = async (blob) => {
  try {
    const arrayBuffer = await blob.arrayBuffer()
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer)
    const data = audioBuffer.getChannelData(0)
    let sum = 0
    for (let i = 0; i < data.length; i++) sum += data[i] * data[i]
    const rms = Math.sqrt(sum / data.length)
    audioCtx.close()
    return rms < 0.015  // below this threshold = silence
  } catch {
    return false  // if check fails, send anyway
  }
}

const P = {
  // Card backgrounds — soft white with gentle tint
  cardWhite: 'rgba(255,255,255,0.92)',
  cardBlue: 'rgba(224,242,254,0.96)',   // very light sky blue
  cardPurple: 'rgba(237,233,254,0.96)',   // very light lavender
  cardPeach: 'rgba(255,237,213,0.96)',   // very light peach
  cardGreen: 'rgba(220,252,231,0.96)',   // very light mint

  // Accent colours — muted, not neon
  blue: '#60a5fa',   // soft sky blue
  purple: '#a78bfa',   // soft lavender
  pink: '#f9a8d4',   // soft rose
  peach: '#fdba74',   // soft peach
  mint: '#6ee7b7',   // soft mint
  yellow: '#fde68a',   // soft butter yellow

  // Text
  dark: '#374151',   // warm dark grey — not harsh black
  medium: '#6b7280',
  light: '#9ca3af',

  // Shadows — very soft
  shadow: '0 4px 24px rgba(0,0,0,0.08)',
  shadowMd: '0 8px 32px rgba(0,0,0,0.10)',
}

// Shared pill style for top bar
const softPill = (bg, shadow) => ({
  background: bg,
  borderRadius: 20,
  padding: '8px 16px',
  display: 'flex', alignItems: 'center', gap: 8,
  boxShadow: shadow || P.shadow,
  border: '2px solid rgba(255,255,255,0.9)',
  backdropFilter: 'blur(12px)',
})

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────
const MimiChat = () => {

  // ── State ─────────────────────────────────────────────────────────────────
  const [sessionState, setSessionState] = useState('idle')
  const [studentName, setStudentName] = useState('')
  const [studentId, setStudentId] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [aiPhase, setAiPhase] = useState('listening')

  const [mimiText, setMimiText] = useState('')
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [imageUrl, setImageUrl] = useState(null)
  const [ytVideo, setYtVideo] = useState(null)
  const [ytPlaying, setYtPlaying] = useState(false)
  const [chatHistory, setChatHistory] = useState([])
  const [answerTimer, setAnswerTimer] = useState(0)
  const [webcamActive, setWebcamActive] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const { currentBgStyle, selectedClothes } = useMimiCustomizer()

  // ── Refs ──────────────────────────────────────────────────────────────────
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const facePollingRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chatHistoryRef = useRef([])
  const sessionStateRef = useRef('idle')
  const aiPhaseRef = useRef('listening')
  const isSpeakingRef = useRef(false)
  const isRecordingRef = useRef(false)
  const studentNameRef = useRef('')
  const studentIdRef = useRef('')
  const sessionIdRef = useRef('')
  const startMimiSessionRef = useRef(null)
  const isMountedRef = useRef(true)
  const greetingActiveRef = useRef(false)
  const consecutiveFailsRef = useRef(0)
  const recordingStartRef = useRef(0)
  const live2dRef = useRef(null)
  const live2dStateRef = useRef(null)

  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  useEffect(() => { log('STATE', `sessionState → ${sessionState}`); sessionStateRef.current = sessionState }, [sessionState])
  useEffect(() => { studentNameRef.current = studentName }, [studentName])
  useEffect(() => { studentIdRef.current = studentId }, [studentId])
  useEffect(() => { sessionIdRef.current = sessionId }, [sessionId])
  useEffect(() => { chatHistoryRef.current = chatHistory }, [chatHistory])

  const setAiPhaseSync = useCallback((phase) => {
    log('STATE', `aiPhase → ${phase}`)
    aiPhaseRef.current = phase
    setAiPhase(phase)
  }, [])

  const generateSessionId = () =>
    `mimi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  const showError = useCallback((msg, ms = 3500) => {
    setErrorMsg(msg)
    setTimeout(() => { if (isMountedRef.current) setErrorMsg('') }, ms)
  }, [])

  // ── Audio ─────────────────────────────────────────────────────────────────
  const playBase64Audio = useCallback((base64, onEnd) => {
    log('AUDIO', 'playBase64Audio, length:', base64?.length)
    if (!base64) { onEnd?.(); return }
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64}`)
      isSpeakingRef.current = true
      setIsSpeaking(true)
      const finish = () => {
        log('AUDIO', 'finished')
        isSpeakingRef.current = false
        setIsSpeaking(false)
        onEnd?.()
      }
      audio.onended = finish
      audio.onerror = (e) => { log('AUDIO', 'onerror', e); finish() }
      audio.play().catch((e) => { log('AUDIO', 'play() rejected', e); finish() })
    } catch (e) {
      log('AUDIO', 'exception', e)
      isSpeakingRef.current = false
      onEnd?.()
    }
  }, [])

  // ── Webcam ────────────────────────────────────────────────────────────────
  const stopWebcam = useCallback(() => {
    log('WEBCAM', 'stopWebcam')
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach(t => t.stop())
      videoRef.current.srcObject = null
    }
    setWebcamActive(false)
  }, [])

  const startWebcam = async () => {
    log('WEBCAM', 'startWebcam')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } })
      if (videoRef.current) { videoRef.current.srcObject = stream; setWebcamActive(true) }
    } catch (err) {
      log('WEBCAM', 'error', err)
      showError('Camera access needed 📷')
    }
  }

  // ── Typewriter — speed scales with text length so long responses aren't slow
  useEffect(() => {
    if (!mimiText) { setDisplayedText(''); setIsTyping(false); return }
    setDisplayedText(''); setIsTyping(true)
    const chars = Array.from(mimiText)
    // Cap at 18ms per char so long responses finish in ~3s max
    const delay = Math.min(18, Math.max(8, Math.floor(2400 / chars.length)))
    let i = 0
    const t = setInterval(() => {
      i++
      setDisplayedText(chars.slice(0, i).join(''))
      if (i >= chars.length) { clearInterval(t); setIsTyping(false) }
    }, delay)
    return () => clearInterval(t)
  }, [mimiText])

  // ── Answer timer — clears response panel after Alexi finishes speaking+typing
  useEffect(() => {
    if (!mimiText || isSpeaking || isTyping) { setAnswerTimer(0); return }
    if (aiPhase !== 'responding' && aiPhase !== 'listening') { setAnswerTimer(0); return }
    setAnswerTimer(8)
    const iv = setInterval(() => {
      setAnswerTimer(prev => {
        if (prev <= 1) {
          clearInterval(iv)
          setMimiText(''); setDisplayedText(''); setImageUrl(null)
          if (!ytPlaying) setYtVideo(null)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(iv)
  }, [mimiText, aiPhase, isSpeaking, isTyping])

  const clearResponse = useCallback(() => {
    setMimiText(''); setDisplayedText('')
    setImageUrl(null)
    // Only clear ytVideo if not currently playing — let the user watch it
    if (!ytPlaying) { setYtVideo(null) }
    setAnswerTimer(0)
  }, [ytPlaying])

  // ── Face detection ────────────────────────────────────────────────────────
  const startFaceDetection = useCallback(async () => {
    log('FACE', 'startFaceDetection')
    if (sessionStateRef.current === 'running') return
    setSessionState('detecting')
    setStudentName(''); setMimiText(''); setDisplayedText('')
    setImageUrl(null); setYtVideo(null); setChatHistory([])
    setIsTyping(false); setAiPhaseSync('listening'); setAnswerTimer(0)
    chatHistoryRef.current = []
    greetingActiveRef.current = false
    await startWebcam()
    facePollingRef.current = setInterval(async () => {
      if (!videoRef.current?.srcObject || !canvasRef.current) return
      try {
        const canvas = canvasRef.current, video = videoRef.current
        canvas.width = 320; canvas.height = 240
        canvas.getContext('2d').drawImage(video, 0, 0, 320, 240)
        const base64 = canvas.toDataURL('image/jpeg', 0.7)
        const res = await axios.post(API_ENDPOINTS.PROCESS_FRAME, { image: base64 })
        log('FACE', `person="${res.data.person}"`)
        if (res.data.person) {
          const name = res.data.person.replace(/_/g, ' ').trim()
          const sid = res.data.student_id || ''
          clearInterval(facePollingRef.current); facePollingRef.current = null
          stopWebcam(); setStudentName(name); setStudentId(sid)
          studentIdRef.current = sid
          startMimiSessionRef.current?.(name, sid)
        }
      } catch (e) { log('FACE', 'PROCESS_FRAME error', e.message) }
    }, 1200)
  }, [stopWebcam])

  // ── Session start ─────────────────────────────────────────────────────────
  const startMimiSession = useCallback(async (name, studentObjId) => {
    log('SESSION', `startMimiSession: "${name}" studentObjId=${studentObjId}`)
    if (sessionStateRef.current === 'running' || greetingActiveRef.current) { log('SESSION', 'skipped'); return }
    const sid = generateSessionId()
    setSessionId(sid); sessionIdRef.current = sid
    setSessionState('running')
    greetingActiveRef.current = true; chatHistoryRef.current = []
    isSpeakingRef.current = false; setIsSpeaking(false)
    setAiPhaseSync('generating')
    setMimiText(''); setDisplayedText(''); setChatHistory([])
    setYtVideo(null); setImageUrl(null)

    // Resolve student MongoDB _id if not provided by PROCESS_FRAME
    let resolvedId = studentObjId
    if (!resolvedId) {
      try {
        const idRes = await axios.post(API_ENDPOINTS.GET_STUDENT_ID, { name })
        if (idRes.data?.status === 'found') resolvedId = idRes.data.student_id
      } catch (e) { log('SESSION', 'ID lookup failed', e.message) }
    }
    if (!resolvedId) {
      log('SESSION', 'No student_id — cannot start session')
      showError('Student not found. Please register first 😊')
      greetingActiveRef.current = false; setAiPhaseSync('listening')
      setSessionState('idle')
      return
    }
    setStudentId(resolvedId); studentIdRef.current = resolvedId

    try {
      const res = await axios.post(API_ENDPOINTS.START_MIMI_SESSION, { student_name: name, student_id: resolvedId, session_id: sid })
      const greetingText = res.data.greeting_text
      const greetingAudio = res.data.greeting_audio
      log('SESSION', 'Greeting received', { greetingText })
      setAiPhaseSync('responding'); setMimiText(greetingText)
      const afterGreeting = () => {
        log('SESSION', 'Greeting done')
        greetingActiveRef.current = false; setAiPhaseSync('listening'); clearResponse()
      }
      if (greetingAudio) playBase64Audio(greetingAudio, afterGreeting)
      else afterGreeting()
    } catch (e) {
      log('SESSION', 'START_MIMI_SESSION failed', e.message)
      showError('Oops! Please try again 😊')
      greetingActiveRef.current = false; setAiPhaseSync('listening')
      setSessionState('idle')
    }
  }, [playBase64Audio, clearResponse, showError])

  useEffect(() => { startMimiSessionRef.current = startMimiSession }, [startMimiSession])

  // ── Session stop ──────────────────────────────────────────────────────────
  const stopSession = useCallback(async () => {
    log('SESSION', 'stopSession')
    clearInterval(facePollingRef.current); facePollingRef.current = null
    greetingActiveRef.current = false; stopWebcam()
    isSpeakingRef.current = false; setIsSpeaking(false)
    setAiPhaseSync('listening'); clearResponse()
    try { await axios.post(API_ENDPOINTS.MIMI_STOP_SESSION, { session_id: sessionIdRef.current }) }
    catch (e) { log('SESSION', 'stop error', e.message) }
    try {
      const res = await axios.get(API_ENDPOINTS.MIMI_CHAT_HISTORY, {
        params: { student_name: studentNameRef.current, session_id: sessionIdRef.current }
      })
      if (!isMountedRef.current) return
      const chats = res.data?.chats || []
      const msgs = chats.flatMap(doc => doc.messages || [])
      setChatHistory(msgs.length > 0 ? msgs : chatHistoryRef.current)
    } catch (e) { if (isMountedRef.current) setChatHistory(chatHistoryRef.current) }
    if (!isMountedRef.current) return
    setSessionState('stopped'); chatHistoryRef.current = []
  }, [stopWebcam, clearResponse])

  // ── Send audio ────────────────────────────────────────────────────────────
  const sendAudioToBackend = useCallback(async (blob) => {
    const state = sessionStateRef.current
    if (state === 'detecting') { log('AUDIO_SEND', 'ignore — detecting'); return }
    if (state === 'running' && aiPhaseRef.current !== 'listening' && aiPhaseRef.current !== 'generating') {
      log('AUDIO_SEND', `drop stale — phase="${aiPhaseRef.current}"`); return
    }
    const endpoint = state === 'running' ? API_ENDPOINTS.MIMI_CHAT_AUDIO : API_ENDPOINTS.MIMI_WAKE
    log('AUDIO_SEND', `Sending ${blob.size}b → ${endpoint}`)
    const formData = new FormData()
    formData.append('audio', blob, 'audio.webm')
    formData.append('student_name', studentNameRef.current)
    formData.append('session_id', sessionIdRef.current)
    try {
      const res = await axios.post(endpoint, formData)
      log('AUDIO_SEND', 'top-level keys:', Object.keys(res.data))
      if (res.data.data) log('AUDIO_SEND', 'data.* keys:', Object.keys(res.data.data))
      consecutiveFailsRef.current = 0
      if (endpoint === API_ENDPOINTS.MIMI_WAKE) {
        const transcribed = res.data.text || ''
        log('AUDIO_SEND', `wake transcription: "${transcribed}"`)
        if (res.data.wake || checkForWakeWord(transcribed)) startFaceDetection()
        return
      }
      if (res.data.status !== 'success') { log('AUDIO_SEND', `non-success: ${res.data.status}`); setAiPhaseSync('listening'); return }
      const transcribed = res.data.text || ''
      log('AUDIO_SEND', `transcription: "${transcribed}"`)
      if (checkForByeWord(transcribed)) { stopSession(); return }
      if (checkForPlayVideoCommand(transcribed)) { setYtPlaying(true); setAiPhaseSync('listening'); return }
      if (!transcribed.trim()) { setAiPhaseSync('listening'); return }
      clearResponse()
      // Answer is in res.data.data.text (confirmed from logs)
      const responseText = res.data.data?.text || res.data.data?.answer || res.data.text || res.data.answer || res.data.response || ''
      const responseAudio = res.data.data?.audio || res.data.audio || null
      log('AUDIO_SEND', `answer — data.text="${(res.data.data?.text || '').slice(0, 60)}"`)
      log('AUDIO_SEND', `✓ using: "${responseText.slice(0, 80)}" | audio=${!!responseAudio}`)
      axios.post(API_ENDPOINTS.MIMI_SAVE_CHAT, {
        student_name: studentNameRef.current, student_id: studentIdRef.current,
        session_id: sessionIdRef.current,
        question: transcribed, answer: responseText,
        image_url: res.data.data?.image_url || res.data.image_url || '',
      }).catch(e => log('AUDIO_SEND', 'SAVE_CHAT error', e.message))
      setAiPhaseSync('responding')
      setMimiText(responseText)
      setImageUrl(res.data.data?.image_url || res.data.image_url || null)
      setYtVideo(res.data.data?.yt_video || res.data.yt_video || null)
      if (responseAudio) {
        playBase64Audio(responseAudio, () => { log('AUDIO_SEND', '✓ audio done'); setAiPhaseSync('listening') })
      } else {
        setAiPhaseSync('listening')
      }
    } catch (e) {
      consecutiveFailsRef.current++
      const backoffMs = Math.min(consecutiveFailsRef.current * 1200, 7000)
      log('AUDIO_SEND', `✗ fail #${consecutiveFailsRef.current} | backoff=${backoffMs}ms | ${e.message}`)
      if (e.response) log('AUDIO_SEND', `  status=${e.response.status} | data=${JSON.stringify(e.response.data)}`)
      if (sessionStateRef.current === 'running') {
        setTimeout(() => { if (isMountedRef.current) setAiPhaseSync('listening') }, backoffMs)
      }
    }
  }, [startFaceDetection, stopSession, playBase64Audio, clearResponse])

  // ── Microphone ────────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    const state = sessionStateRef.current
    if (state === 'detecting') return
    if (state === 'stopped') return
    if (greetingActiveRef.current) return
    if (isRecordingRef.current) return
    if (isSpeakingRef.current) return
    if (aiPhaseRef.current !== 'listening') return
    isRecordingRef.current = true; setIsRecording(true)
    recordingStartRef.current = Date.now()
    log('MIC', `▶ startRecording — state=${state}`)
    try {
      const t0 = Date.now()
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      log('MIC', `mic acquired in ${Date.now() - t0}ms`)
      const recorder = new MediaRecorder(stream)
      const chunks = []
      recorder.ondataavailable = (e) => { if (e.data.size > 0) { chunks.push(e.data); log('MIC', `chunk: ${e.data.size}b`) } }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        isRecordingRef.current = false; setIsRecording(false)
        const blob = new Blob(chunks, { type: 'audio/webm' })
        const duration = Date.now() - recordingStartRef.current
        log('MIC', `⏹ stopped — blob=${blob.size}b | duration=${duration}ms`)
        // ── Silence check: skip sending if no real speech detected ──
        const silent = await isSilence(blob)
        if (silent) {
          log('MIC', 'silence detected — skipping send')
          setAiPhaseSync('listening')
          return
        }
        if (sessionStateRef.current === 'running') {
          log('MIC', '→ showing Thinking…'); setAiPhaseSync('generating')
        }
        await sendAudioToBackend(blob)
      }
      mediaRecorderRef.current = recorder
      recorder.start()
      log('MIC', 'recording started — will stop in 4000ms')
      setTimeout(() => { if (recorder.state === 'recording') { log('MIC', '4s timeout'); recorder.stop() } }, 4000)
    } catch (e) {
      log('MIC', 'getUserMedia error', e.message)
      isRecordingRef.current = false; setIsRecording(false)
      showError('Microphone access needed 🎤')
    }
  }, [sendAudioToBackend, showError, setAiPhaseSync])

  useEffect(() => {
    if (!isRecording && !isSpeaking && aiPhase === 'listening' &&
      sessionState !== 'detecting' && sessionState !== 'stopped') {
      const t = setTimeout(startRecording, 50)
      return () => clearTimeout(t)
    }
  }, [isRecording, isSpeaking, aiPhase, sessionState, startRecording])

  useEffect(() => {
    return () => { clearInterval(facePollingRef.current); stopWebcam() }
  }, [stopWebcam])

  const resetToIdle = () => {
    setSessionState('idle'); setStudentName(''); setChatHistory([])
    setAiPhaseSync('listening'); clearResponse()
    setIsTyping(false); setAnswerTimer(0)
    chatHistoryRef.current = []; greetingActiveRef.current = false
    isSpeakingRef.current = false; consecutiveFailsRef.current = 0
    setIsSpeaking(false)
    // Only clear selectedChild for Parent Portal — Teacher Portal doesn't set it
    const role = localStorage.getItem('role')
    if (role !== 'teacher' && role !== 'admin') localStorage.removeItem('selectedChild')
  }

  const embedUrl = getYtEmbedUrl(ytVideo)
  const showListening = sessionState === 'running' && aiPhase === 'listening' && !isSpeaking
  // Show response panel: text response OR an active YouTube video
  const showResponse = sessionState === 'running' &&
    ((!!mimiText && (aiPhase === 'responding' || aiPhase === 'listening')) || !!ytVideo)

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      position: 'relative', minHeight: '100vh', width: '100%', overflow: 'hidden',
      // backgroundImage: `url(${bgImage})`,
      backgroundImage: currentBgStyle,
      backgroundSize: '100% 100%',
      backgroundPosition: 'center',
      fontFamily: "'Nunito', 'Varela Round', 'Comic Sans MS', cursive",
    }}>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <MimiCustomizer />

      {/* Character — absolutely pinned to bottom-left */}
      <div style={{
        position: 'absolute',
        bottom: '-19%',     // 👈 slight negative to "sink" feet
        left: '30px',
        width: '480px',
        height: 'auto',      // 👈 don't force height
        zIndex: 3,
        pointerEvents: 'none',
      }}>
        <MimiCharacter
          modelRef={live2dRef}
          stateRef={live2dStateRef}
          isSpeaking={isSpeaking}
          outfit={selectedClothes || 'uniform'}
        />
      </div>

      {/* Soft vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'linear-gradient(to top, rgba(0,0,0,0.12) 0%, transparent 40%)',
      }} />



      {/* ── Error banner ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            style={{
              position: 'absolute', top: 16, left: '50%', transform: 'translateX(-50%)',
              zIndex: 60, padding: '10px 22px', borderRadius: 20,
              background: 'rgba(254,226,226,0.97)',
              border: '2px solid #fca5a5',
              boxShadow: '0 4px 20px rgba(252,165,165,0.3)',
              fontSize: 14, fontWeight: 700, color: '#991b1b',
            }}
          >
            😅 {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <div style={{
        position: 'absolute', top: 10, left: 8, right: 8, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        gap: 6, flexWrap: 'wrap',
      }}>

        {/* Student name */}
        <AnimatePresence>
          {studentName && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, x: 10 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ type: 'spring', stiffness: 380, damping: 22 }}
              style={softPill('rgba(253,232,255,0.95)', '0 4px 16px rgba(167,139,250,0.2)')}
            >
              <span style={{ fontSize: 16 }}>🌸</span>
              <span style={{
                fontSize: 12, fontWeight: 800, color: '#7c3aed',
                maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }}>
                {studentName}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Test speaking button — dev only */}
        {import.meta.env.DEV && (
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={() => {
              console.log('[TEST] isSpeaking → true')
              setIsSpeaking(true)
              isSpeakingRef.current = true
              setTimeout(() => {
                console.log('[TEST] isSpeaking → false')
                setIsSpeaking(false)
                isSpeakingRef.current = false
              }, 4000)
            }}
            style={{
              ...softPill('rgba(220,252,231,0.97)', '0 4px 16px rgba(110,231,183,0.25)'),
              cursor: 'pointer', border: '2px solid rgba(110,231,183,0.8)',
              fontFamily: 'inherit', padding: '6px 12px',
            }}
          >
            <span style={{ fontSize: 16 }}>🗣️</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#065f46' }}>Test Speak</span>
          </motion.button>
        )}

        {/* Start / Stop */}
        {(sessionState === 'idle' || sessionState === 'stopped') && (
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={startFaceDetection}
            style={{
              ...softPill('rgba(219,234,254,0.97)', '0 4px 16px rgba(96,165,250,0.25)'),
              cursor: 'pointer', border: '2px solid rgba(147,197,253,0.8)',
              fontFamily: 'inherit', padding: '6px 12px',
            }}
          >
            <span style={{ fontSize: 16 }}>🎈</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#1d4ed8' }}>Let's Start!</span>
          </motion.button>
        )}

        {sessionState === 'running' && (
          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            onClick={stopSession}
            style={{
              ...softPill('rgba(254,226,226,0.97)', '0 4px 16px rgba(252,165,165,0.25)'),
              cursor: 'pointer', border: '2px solid rgba(252,165,165,0.8)',
              fontFamily: 'inherit', padding: '6px 12px',
            }}
          >
            <span style={{ fontSize: 16 }}>👋</span>
            <span style={{ fontSize: 12, fontWeight: 800, color: '#b91c1c' }}>Bye Alexi!</span>
          </motion.button>
        )}

        {/* Status */}
        <motion.div
          animate={sessionState === 'running' ? { scale: [1, 1.04, 1] } : {}}
          transition={{ duration: 2.5, repeat: Infinity }}
          style={{
            ...softPill(
              sessionState === 'running' ? 'rgba(209,250,229,0.97)' :
                sessionState === 'detecting' ? 'rgba(254,249,195,0.97)' :
                  'rgba(243,244,246,0.97)',
              '0 4px 16px rgba(0,0,0,0.08)'
            ),
            padding: '6px 10px',
          }}
        >
          <motion.span
            animate={sessionState === 'running' ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
            style={{ fontSize: 10 }}
          >
            {sessionState === 'running' ? '🟢' : sessionState === 'detecting' ? '🟡' : '⚪'}
          </motion.span>
          <span style={{ fontSize: 11, fontWeight: 700, color: P.dark }}>
            {sessionState === 'idle' ? 'Ready' :
              sessionState === 'detecting' ? 'Looking…' :
                sessionState === 'running' ? 'Playing!' : 'Done!'}
          </span>
        </motion.div>
      </div>

      {/* ── Face Detection Modal ───────────────────────────────────────────── */}
      <AnimatePresence>
        {sessionState === 'detecting' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.75, y: 32, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24 }}
              style={{
                background: 'rgba(255,255,255,0.97)',
                borderRadius: 32, padding: '28px 28px 22px',
                maxWidth: 390, width: '100%', margin: '0 16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                border: '2px solid rgba(167,139,250,0.25)',
                textAlign: 'center',
              }}
            >
              {/* Camera viewport */}
              <div style={{
                position: 'relative', width: '100%', aspectRatio: '4/3',
                background: '#f1f5f9', borderRadius: 20, overflow: 'hidden',
                marginBottom: 20, border: '2px solid rgba(167,139,250,0.2)',
              }}>
                <video ref={videoRef} autoPlay playsInline muted
                  style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />

                {/* Soft scan line */}
                <motion.div
                  animate={{ top: ['8%', '92%', '8%'] }}
                  transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
                  style={{
                    position: 'absolute', left: '10%', right: '10%', height: 2,
                    background: 'linear-gradient(90deg,transparent,rgba(167,139,250,0.7),transparent)',
                    borderRadius: 2,
                  }}
                />

                {/* Corner accents */}
                {[
                  { top: 8, left: 8, borderTop: '2.5px solid #a78bfa', borderLeft: '2.5px solid #a78bfa' },
                  { top: 8, right: 8, borderTop: '2.5px solid #a78bfa', borderRight: '2.5px solid #a78bfa' },
                  { bottom: 8, left: 8, borderBottom: '2.5px solid #a78bfa', borderLeft: '2.5px solid #a78bfa' },
                  { bottom: 8, right: 8, borderBottom: '2.5px solid #a78bfa', borderRight: '2.5px solid #a78bfa' },
                ].map((st, i) => (
                  <div key={i} style={{ position: 'absolute', width: 18, height: 18, borderRadius: 3, ...st }} />
                ))}

                {!webcamActive && (
                  <div style={{
                    position: 'absolute', inset: 0, display: 'flex',
                    alignItems: 'center', justifyContent: 'center', background: 'rgba(241,245,249,0.9)',
                  }}>
                    <p style={{ color: '#a78bfa', fontWeight: 700, fontSize: 14 }}>📷 Opening camera…</p>
                  </div>
                )}
              </div>

              <motion.p style={{ fontSize: 36, marginBottom: 8 }}
                animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                👀
              </motion.p>
              <h2 style={{ color: P.dark, fontWeight: 900, fontSize: 20, marginBottom: 6 }}>
                Who is it?
              </h2>
              <p style={{ color: P.medium, fontSize: 14, fontWeight: 600, marginBottom: 18 }}>
                Look at the camera so I can see you!
              </p>

              {/* Soft bouncing dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 18 }}>
                {[P.blue, P.purple, P.pink].map((color, i) => (
                  <motion.div key={i}
                    animate={{ y: [0, -8, 0] }}
                    transition={{ duration: 0.75, repeat: Infinity, delay: i * 0.18 }}
                    style={{ width: 10, height: 10, borderRadius: '50%', background: color }}
                  />
                ))}
              </div>

              <button
                onClick={() => { clearInterval(facePollingRef.current); facePollingRef.current = null; stopWebcam(); setSessionState('idle') }}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: P.light, fontSize: 13, fontWeight: 600,
                  letterSpacing: '0.08em', fontFamily: 'inherit',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#f87171'}
                onMouseLeave={e => e.currentTarget.style.color = P.light}
              >
                Go back
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Session Complete Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {sessionState === 'stopped' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.35)', backdropFilter: 'blur(10px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.75, y: 32, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 24 }}
              style={{
                background: 'rgba(255,255,255,0.97)',
                borderRadius: 32, padding: '36px 40px',
                textAlign: 'center', maxWidth: 340, width: '100%', margin: '0 16px',
                boxShadow: '0 20px 60px rgba(0,0,0,0.12)',
                border: '2px solid rgba(110,231,183,0.35)',
              }}
            >
              {/* Confetti sparkles */}
              {['⭐', '✨', '🌟', '🎊', '💫'].map((e, i) => (
                <motion.div key={i}
                  initial={{ y: 0, opacity: 0, x: 0 }}
                  animate={{ y: [-20, -70], opacity: [0, 1, 0], x: (i - 2) * 22 }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 1.2, repeat: Infinity, repeatDelay: 2.5 }}
                  style={{ position: 'absolute', fontSize: 20, left: '50%' }}
                >
                  {e}
                </motion.div>
              ))}

              <motion.div
                animate={{ rotate: [-5, 5, -5], scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ fontSize: 60, marginBottom: 14, display: 'block' }}
              >
                🎉
              </motion.div>

              <h2 style={{ color: P.dark, fontWeight: 900, fontSize: 22, marginBottom: 10, lineHeight: 1.3 }}>
                Great job, {studentName}! 🌟
              </h2>
              <p style={{ color: P.medium, fontSize: 15, fontWeight: 700, marginBottom: 4 }}>
                You asked{' '}
                <span style={{ color: '#6ee7b7', fontSize: 20, fontWeight: 900 }}>{chatHistory.length}</span>
                {' '}questions!
              </p>
              <p style={{ color: P.light, fontSize: 13, fontWeight: 600, marginBottom: 26 }}>
                You're so curious and smart 🧠
              </p>

              <motion.button
                whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
                onClick={resetToIdle}
                style={{
                  padding: '13px 30px', borderRadius: 20,
                  background: 'linear-gradient(135deg, #93c5fd, #60a5fa)',
                  border: '2px solid rgba(255,255,255,0.8)',
                  color: '#fff', fontWeight: 900, fontSize: 15,
                  cursor: 'pointer', fontFamily: 'inherit',
                  boxShadow: '0 6px 20px rgba(96,165,250,0.35)',
                }}
              >
                🔄 Play Again!
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Thinking indicator ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {sessionState === 'running' && aiPhase === 'generating' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 16 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
            style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)', zIndex: 40,
            }}
          >
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10,
              padding: '18px 28px', borderRadius: 24,
              background: 'rgba(255,255,255,0.97)',
              border: '2px solid rgba(167,139,250,0.2)',
              boxShadow: '0 12px 40px rgba(0,0,0,0.1)',
            }}>
              {/* Gentle pulsing emoji */}
              <motion.span
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                style={{ fontSize: 34 }}
              >
                🤔
              </motion.span>

              {/* Soft bouncing dots */}
              <div style={{ display: 'flex', gap: 6 }}>
                {[P.blue, P.purple, P.pink].map((color, i) => (
                  <motion.div key={i}
                    animate={{ y: [0, -6, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.2 }}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: color }}
                  />
                ))}
              </div>

              <span style={{ fontSize: 14, fontWeight: 700, color: P.medium }}>
                Let me think…
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Stage ────────────────────────────────────────────────────── */}
      {/* On mobile: stack vertically (column). On desktop: row with avatar left, response right */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
      }}>
        {/* Response panel — sits at TOP on mobile so it's always visible */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          padding: '80px 10px 8px',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          maxHeight: '60vh',
        }}>
          <AnimatePresence>
            {showResponse && (
              <motion.div
                key={mimiText}
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 26 }}
                style={{
                  background: 'rgba(255,255,255,0.97)',
                  borderRadius: 20, overflow: 'hidden',
                  border: '2px solid rgba(147,197,253,0.4)',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                  maxWidth: 480,
                  width: '100%',
                  alignSelf: 'center',
                }}
              >
                {/* Header */}
                <div style={{
                  padding: '12px 18px 10px',
                  borderBottom: '1.5px solid rgba(224,242,254,0.8)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  background: 'linear-gradient(135deg, rgba(219,234,254,0.5), rgba(237,233,254,0.3))',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <motion.span
                      animate={isSpeaking ? { scale: [1, 1.25, 1] } : { scale: 1 }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      style={{ fontSize: 20 }}
                    >
                      {isSpeaking ? '🔊' : '💬'}
                    </motion.span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: '#3b82f6', letterSpacing: 0.3 }}>
                      {isSpeaking ? 'Alexi is talking…' : 'Alexi says'}
                    </span>
                  </div>
                  {!isSpeaking && !isTyping && answerTimer > 0 && (
                    <span style={{
                      fontSize: 12, fontWeight: 700, color: P.light,
                      background: 'rgba(219,234,254,0.7)',
                      padding: '2px 10px', borderRadius: 10,
                    }}>
                      {answerTimer}s
                    </span>
                  )}
                </div>

                {/* Answer text */}
                <div style={{ padding: '14px 18px' }}>
                  <p style={{
                    fontSize: 15, fontWeight: 700, color: P.dark,
                    lineHeight: 1.6, minHeight: 36, margin: 0,
                  }}>
                    {displayedText}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.55, repeat: Infinity }}
                        style={{ marginLeft: 1, color: P.blue }}
                      >▌</motion.span>
                    )}
                  </p>
                </div>

                {/* Image */}
                {imageUrl && (
                  <div style={{ padding: '0 18px 14px' }}>
                    <motion.img
                      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                      src={imageUrl} alt="result" referrerPolicy="no-referrer"
                      style={{
                        maxHeight: 160, maxWidth: '100%', margin: '0 auto', display: 'block',
                        borderRadius: 16, objectFit: 'contain',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                        border: '2px solid rgba(224,242,254,0.8)',
                      }}
                    />
                  </div>
                )}

                {/* YouTube */}
                {embedUrl && (
                  <div style={{ padding: '0 18px 14px' }}>
                    <motion.div
                      initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }}
                      style={{ width: '100%', maxWidth: 320, margin: '0 auto' }}
                    >
                      <div style={{
                        borderRadius: 16, overflow: 'hidden', aspectRatio: '16/9',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
                        border: '2px solid rgba(224,242,254,0.8)',
                      }}>
                        <iframe
                          key={ytPlaying ? 'playing' : 'paused'}
                          src={ytPlaying ? `${embedUrl}?autoplay=1&rel=0` : `${embedUrl}?rel=0`}
                          title="YouTube video"
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
                        />
                      </div>
                      {!ytPlaying && (
                        <p style={{ textAlign: 'center', fontSize: 12, color: P.light, marginTop: 6, fontWeight: 600 }}>
                          🎬 Say <strong style={{ color: P.blue }}>"Alexi play video"</strong>
                        </p>
                      )}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Bottom row: listening indicator only — character is absolutely positioned */}
        <div style={{ display: 'flex', alignItems: 'flex-end', flexShrink: 0, pointerEvents: 'none' }}>
          <div style={{ width: '420px', flexShrink: 0 }} />

          {/* Listening indicator */}
          <AnimatePresence>
            {showListening && (
              <motion.div
                key="listening"
                initial={{ opacity: 0, scale: 0.8, y: 8 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8, y: 8 }}
                transition={{ type: 'spring', stiffness: 380, damping: 22 }}
                style={{ marginBottom: 60, marginLeft: 8 }}
              >
                <div style={{
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: 20, padding: '10px 18px',
                  display: 'flex', alignItems: 'center', gap: 10,
                  border: '2px solid rgba(167,139,250,0.3)',
                  boxShadow: '0 6px 20px rgba(167,139,250,0.15)',
                }}>
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    style={{ fontSize: 20 }}
                  >
                    🎤
                  </motion.span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                    {[0, 0.15, 0.3, 0.15, 0].map((delay, i) => (
                      <motion.div key={i}
                        animate={{ height: [5, 16, 5] }}
                        transition={{ duration: 0.65, repeat: Infinity, delay }}
                        style={{
                          width: 3.5, minHeight: 5,
                          background: `linear-gradient(to top, ${P.purple}, ${P.blue})`,
                          borderRadius: 3,
                        }}
                      />
                    ))}
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#7c3aed' }}>
                    I'm listening!
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default MimiChat