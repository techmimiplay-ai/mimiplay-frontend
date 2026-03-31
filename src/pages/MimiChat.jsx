import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { API_ENDPOINTS } from '../config'
import { ListeningIndicator } from '../components/mimi/ui-elements'

import bgImage       from '../assets/images/mimi/bg.jpg'
import mimiIdleVideo from '../assets/images/mimi/mimiidell_nobg.webm'
import mimiWaveVideo from '../assets/images/mimi/mimiwavehand_nobg.webm'

// ── Logging helper ─────────────────────────────────────────────────────────
const log = (area, msg, data) => {
  const ts = new Date().toISOString().slice(11, 23)
  if (data !== undefined) console.log(`[${ts}] [${area}] ${msg}`, data)
  else                    console.log(`[${ts}] [${area}] ${msg}`)
}

// ── Wake / Stop word helpers ───────────────────────────────────────────────
const checkForWakeWord = (text) => {
  if (!text) return false
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '').trim()
  return (
    lower.includes('hey alexi')   || lower.includes('hey alexa')   ||
    lower.includes('hi alexi')    || lower.includes('hi alexa')    ||
    lower.includes('hello alexi') || lower.includes('hello alexa') ||
    lower.includes('okay alexi')  || lower.includes('ok alexi')    ||
    lower.includes('okay alexa')  || lower.includes('ok alexa')
  )
}

const checkForByeWord = (text) => {
  if (!text) return false
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '').trim()
  return (
    lower.includes('bye alexi')     || lower.includes('bye alexa')     ||
    lower.includes('goodbye alexi') || lower.includes('goodbye alexa') ||
    lower.includes('stop alexi')    || lower.includes('stop alexa')    ||
    lower.includes('alexi stop')    || lower.includes('alexa stop')    ||
    lower.includes('exit alexi')    || lower.includes('exit alexa')
  )
}

const checkForPlayVideoCommand = (text) => {
  if (!text) return false
  const lower = text.toLowerCase().replace(/[^a-z\s]/g, '').trim()
  return (
    lower.includes('alexi play video')     || lower.includes('alexa play video')     ||
    lower.includes('alexi play the video') || lower.includes('alexa play the video') ||
    lower.includes('play the video')       || lower.includes('play video')
  )
}

const getYtEmbedUrl = (url) => {
  if (!url) return null
  if (url.includes('/embed/')) return url
  const match = url.match(/(?:v=|youtu\.be\/)([A-Za-z0-9_-]{11})/)
  return match ? `https://www.youtube.com/embed/${match[1]}` : null
}

const MimiChat = () => {

  // ── Session state ────────────────────────────────────────────────────────
  const [sessionState, setSessionState] = useState('idle')
  const [studentName, setStudentName]   = useState('')
  const [sessionId, setSessionId]       = useState('')

  // ── AI phase ─────────────────────────────────────────────────────────────
  const [aiPhase, setAiPhase] = useState('listening')

  // ── UI display ───────────────────────────────────────────────────────────
  const [mimiText, setMimiText]           = useState('')
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping]           = useState(false)
  const [imageUrl, setImageUrl]           = useState(null)
  const [ytVideo, setYtVideo]             = useState(null)
  const [ytPlaying, setYtPlaying]         = useState(false)
  const [chatHistory, setChatHistory]     = useState([])
  const [answerTimer, setAnswerTimer]     = useState(0)
  const [webcamActive, setWebcamActive]   = useState(false)
  const [isRecording, setIsRecording]     = useState(false)
  const [isSpeaking, setIsSpeaking]       = useState(false)

  // ── Refs ─────────────────────────────────────────────────────────────────
  const videoRef            = useRef(null)
  const canvasRef           = useRef(null)
  const facePollingRef      = useRef(null)
  const mediaRecorderRef    = useRef(null)
  const chatHistoryRef      = useRef([])
  const sessionStateRef     = useRef('idle')
  const aiPhaseRef          = useRef('listening')
  const isSpeakingRef       = useRef(false)
  const isRecordingRef      = useRef(false)
  const studentNameRef      = useRef('')
  const sessionIdRef        = useRef('')
  const startMimiSessionRef = useRef(null)
  const isMountedRef        = useRef(true)
  const greetingActiveRef   = useRef(false)

  useEffect(() => {
    isMountedRef.current = true
    return () => { isMountedRef.current = false }
  }, [])

  useEffect(() => { log('STATE', `sessionState → ${sessionState}`); sessionStateRef.current = sessionState }, [sessionState])
  useEffect(() => { studentNameRef.current = studentName }, [studentName])
  useEffect(() => { sessionIdRef.current   = sessionId   }, [sessionId])
  useEffect(() => { chatHistoryRef.current = chatHistory }, [chatHistory])

  const setAiPhaseSync = useCallback((phase) => {
    log('STATE', `aiPhase → ${phase}`)
    aiPhaseRef.current = phase
    setAiPhase(phase)
  }, [])

  const generateSessionId = () =>
    `mimi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  // ── Play base64 WAV audio ────────────────────────────────────────────────
  const playBase64Audio = useCallback((base64, onEnd) => {
    log('AUDIO', 'playBase64Audio called, length:', base64?.length)
    if (!base64) { if (onEnd) onEnd(); return }
    try {
      const audio = new Audio(`data:audio/wav;base64,${base64}`)
      isSpeakingRef.current = true
      setIsSpeaking(true)
      const finish = () => {
        log('AUDIO', 'finished')
        isSpeakingRef.current = false
        setIsSpeaking(false)
        if (onEnd) onEnd()
      }
      audio.onended = finish
      audio.onerror = (e) => { log('AUDIO', 'onerror', e); finish() }
      audio.play().catch((e) => { log('AUDIO', 'play() rejected', e); finish() })
    } catch (e) {
      log('AUDIO', 'exception', e)
      isSpeakingRef.current = false
      if (onEnd) onEnd()
    }
  }, [])

  // ── Webcam ───────────────────────────────────────────────────────────────
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
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setWebcamActive(true)
        log('WEBCAM', 'started OK')
      }
    } catch (err) {
      log('WEBCAM', 'getUserMedia error', err)
      alert('Please allow camera access for face detection.')
    }
  }

  // ── Typewriter effect ────────────────────────────────────────────────────
  useEffect(() => {
    if (!mimiText) { setDisplayedText(''); setIsTyping(false); return }
    setDisplayedText('')
    setIsTyping(true)
    const chars = Array.from(mimiText)
    let i = 0
    const t = setInterval(() => {
      i++
      setDisplayedText(chars.slice(0, i).join(''))
      if (i >= chars.length) { clearInterval(t); setIsTyping(false) }
    }, 28)
    return () => clearInterval(t)
  }, [mimiText])

  // ── Answer display timer ─────────────────────────────────────────────────
  useEffect(() => {
    if (!mimiText || aiPhase !== 'responding' || isSpeaking) {
      setAnswerTimer(0)
      return
    }
    log('TIMER', 'Answer timer started (6s)')
    setAnswerTimer(6)
    const interval = setInterval(() => {
      setAnswerTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          if (!isSpeakingRef.current) {
            setMimiText(''); setDisplayedText(''); setImageUrl(null); setYtVideo(null)
            setAiPhaseSync('listening')
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [mimiText, aiPhase, isSpeaking])

  const clearResponse = useCallback(() => {
    setMimiText(''); setDisplayedText(''); setImageUrl(null); setYtVideo(null)
    setYtPlaying(false); setAnswerTimer(0)
  }, [])

  // ── Face detection ───────────────────────────────────────────────────────
  const startFaceDetection = useCallback(async () => {
    log('FACE', 'startFaceDetection called')
    if (sessionStateRef.current === 'running') {
      log('FACE', 'skipped — session already running')
      return
    }

    setSessionState('detecting')
    setStudentName(''); setMimiText(''); setDisplayedText('')
    setImageUrl(null); setYtVideo(null); setChatHistory([])
    setIsTyping(false); setAiPhaseSync('listening'); setAnswerTimer(0)
    chatHistoryRef.current    = []
    greetingActiveRef.current = false

    await startWebcam()

    facePollingRef.current = setInterval(async () => {
      if (!videoRef.current?.srcObject || !canvasRef.current) return
      try {
        const canvas = canvasRef.current
        const video  = videoRef.current
        canvas.width = 320; canvas.height = 240
        canvas.getContext('2d').drawImage(video, 0, 0, 320, 240)
        const base64 = canvas.toDataURL('image/jpeg', 0.7)
        const res    = await axios.post(API_ENDPOINTS.PROCESS_FRAME, { image: base64 })
        log('FACE', `PROCESS_FRAME: person="${res.data.person}"`)
        if (res.data.person) {
          const name = res.data.person.replace(/_/g, ' ').trim()
          clearInterval(facePollingRef.current)
          facePollingRef.current = null
          stopWebcam()
          setStudentName(name)
          startMimiSessionRef.current?.(name)
        }
      } catch (e) { log('FACE', 'PROCESS_FRAME error', e.message) }
    }, 1200)
  }, [stopWebcam])

  // ── Session start ────────────────────────────────────────────────────────
  const startMimiSession = useCallback(async (name) => {
    log('SESSION', `startMimiSession: "${name}"`)
    if (sessionStateRef.current === 'running' || greetingActiveRef.current) {
      log('SESSION', 'skipped — already running or greeting active')
      return
    }

    const sid = generateSessionId()
    setSessionId(sid)
    sessionIdRef.current = sid
    setSessionState('running')

    greetingActiveRef.current = true
    chatHistoryRef.current    = []
    isSpeakingRef.current     = false
    setIsSpeaking(false)

    setAiPhaseSync('generating')
    setMimiText(''); setDisplayedText(''); setChatHistory([])
    setYtVideo(null); setImageUrl(null)

    try {
      const res           = await axios.post(API_ENDPOINTS.START_MIMI_SESSION, { student_name: name, session_id: sid })
      const greetingAudio = res.data.greeting_audio
      const greetingText  = res.data.greeting_text
      log('SESSION', 'Greeting received', { greetingText })

      setAiPhaseSync('responding')
      setMimiText(greetingText)

      const afterGreeting = () => {
        log('SESSION', 'Greeting done — switching to listening')
        greetingActiveRef.current = false
        setAiPhaseSync('listening')
        clearResponse()
      }

      if (greetingAudio) playBase64Audio(greetingAudio, afterGreeting)
      else {
        log('SESSION', 'No greeting audio from backend — skipping to listening')
        afterGreeting()
      }

    } catch (e) {
      log('SESSION', 'START_MIMI_SESSION failed', e.message)
      greetingActiveRef.current = false
      setAiPhaseSync('listening')
    }
  }, [playBase64Audio, clearResponse])

  useEffect(() => {
    startMimiSessionRef.current = startMimiSession
  }, [startMimiSession])

  // ── Session stop ─────────────────────────────────────────────────────────
  const stopSession = useCallback(async () => {
    log('SESSION', 'stopSession called')
    clearInterval(facePollingRef.current)
    facePollingRef.current    = null
    greetingActiveRef.current = false
    stopWebcam()

    isSpeakingRef.current = false
    setIsSpeaking(false)
    setAiPhaseSync('listening')
    clearResponse()

    try {
      await axios.post(API_ENDPOINTS.MIMI_STOP_SESSION, { session_id: sessionIdRef.current })
      log('SESSION', 'MIMI_STOP_SESSION OK')
    } catch (e) { log('SESSION', 'MIMI_STOP_SESSION error', e.message) }

    try {
      const res   = await axios.get(API_ENDPOINTS.MIMI_CHAT_HISTORY, {
        params: { student_name: studentNameRef.current, session_id: sessionIdRef.current }
      })
      if (!isMountedRef.current) return
      const chats    = res.data?.chats || []
      const messages = chats.flatMap(doc => doc.messages || [])
      setChatHistory(messages.length > 0 ? messages : chatHistoryRef.current)
    } catch (e) {
      if (isMountedRef.current) setChatHistory(chatHistoryRef.current)
    }

    if (!isMountedRef.current) return
    setSessionState('stopped')
    chatHistoryRef.current = []
  }, [stopWebcam, clearResponse])

  // ── Send audio to backend ────────────────────────────────────────────────
  const sendAudioToBackend = useCallback(async (blob) => {
    const state = sessionStateRef.current
    if (state === 'detecting') {
      log('AUDIO_SEND', 'ignore — face detection active')
      return
    }
    if (state === 'running' && aiPhaseRef.current !== 'listening') {
      log('AUDIO_SEND', `drop stale blob — phase is "${aiPhaseRef.current}"`)
      return
    }

    const endpoint = (state === 'running')
      ? API_ENDPOINTS.MIMI_CHAT_AUDIO
      : API_ENDPOINTS.MIMI_WAKE

    if (state === 'running') setAiPhaseSync('generating')

    log('AUDIO_SEND', `Sending ${blob.size}b → ${endpoint}`)

    const formData = new FormData()
    formData.append('audio', blob, 'audio.webm')
    formData.append('student_name', studentNameRef.current)
    formData.append('session_id',   sessionIdRef.current)

    try {
      const res = await axios.post(endpoint, formData)
      log('AUDIO_SEND', 'Response:', res.data)

      if (endpoint === API_ENDPOINTS.MIMI_WAKE) {
        const transcribed = res.data.text || ''
        log('AUDIO_SEND', `Wake transcription: "${transcribed}"`)
        if (res.data.wake || checkForWakeWord(transcribed)) {
          log('AUDIO_SEND', 'Wake word detected')
          startFaceDetection()
        }
        return
      }

      if (res.data.status !== 'success') {
        log('AUDIO_SEND', `Non-success: ${res.data.status}`)
        setAiPhaseSync('listening')
        return
      }

      const transcribed = res.data.text || ''
      log('AUDIO_SEND', `Transcribed: "${transcribed}"`)

      if (checkForByeWord(transcribed)) {
        log('AUDIO_SEND', 'Stop word — ending session')
        stopSession()
        return
      }

      if (checkForPlayVideoCommand(transcribed)) {
        log('AUDIO_SEND', 'Play video command detected')
        setYtPlaying(true)
        setAiPhaseSync('listening')
        return
      }

      if (!transcribed.trim()) {
        log('AUDIO_SEND', 'Empty transcription — back to listening')
        setAiPhaseSync('listening')
        return
      }

      log('AUDIO_SEND', 'Got answer from backend')
      clearResponse()

      try {
        await axios.post(API_ENDPOINTS.MIMI_SAVE_CHAT, {
          student_name: studentNameRef.current,
          session_id:   sessionIdRef.current,
          question:     transcribed,
          answer:       res.data.data?.answer || res.data.text || '',
          image_url:    res.data.data?.image_url || '',
        })
      } catch (saveErr) { log('AUDIO_SEND', 'MIMI_SAVE_CHAT error', saveErr.message) }

      const responseText  = res.data.data?.answer || res.data.text || ''
      const responseAudio = res.data.data?.audio  || res.data.audio || null

      log('AUDIO_SEND', `Response text: "${responseText?.slice(0, 60)}" audio=${!!responseAudio}`)

      setAiPhaseSync('responding')
      setMimiText(responseText)
      setImageUrl(res.data.data?.image_url || res.data.image_url || null)
      setYtVideo(res.data.data?.yt_video   || res.data.yt_video  || null)

      const afterSpeak = () => {
        log('AUDIO_SEND', 'Response done — back to listening')
        setAiPhaseSync('listening')
      }

      if (responseAudio) playBase64Audio(responseAudio, afterSpeak)

    } catch (e) {
      log('AUDIO_SEND', 'Request failed', e.message)
      if (sessionStateRef.current === 'running') setAiPhaseSync('listening')
    }
  }, [startFaceDetection, stopSession, playBase64Audio, clearResponse])

  // ── Microphone recording ─────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    const state = sessionStateRef.current
    if (state === 'detecting')     return
    if (greetingActiveRef.current) return
    if (isRecordingRef.current)    return
    if (isSpeakingRef.current)     return
    if (aiPhaseRef.current !== 'listening') return

    isRecordingRef.current = true
    setIsRecording(true)
    log('MIC', `startRecording, state=${state}`)

    try {
      const stream   = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks   = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop())
        isRecordingRef.current = false
        setIsRecording(false)
        const blob = new Blob(chunks, { type: 'audio/webm' })
        await sendAudioToBackend(blob)
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      const duration = (state === 'idle' || state === 'stopped') ? 2500 : 4000
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
      }, duration)

    } catch (e) {
      log('MIC', 'getUserMedia error', e.message)
      isRecordingRef.current = false
      setIsRecording(false)
    }
  }, [sendAudioToBackend])

  // ── Continuous recording loop ────────────────────────────────────────────
  useEffect(() => {
    if (
      !isRecording &&
      !isSpeaking &&
      aiPhase === 'listening' &&
      sessionState !== 'detecting'
    ) {
      const t = setTimeout(startRecording, 50)
      return () => clearTimeout(t)
    }
  }, [isRecording, isSpeaking, aiPhase, sessionState, startRecording])

  // ── Cleanup on unmount ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(facePollingRef.current)
      facePollingRef.current = null
      stopWebcam()
    }
  }, [stopWebcam])

  // ── Reset to idle ────────────────────────────────────────────────────────
  const resetToIdle = () => {
    setSessionState('idle')
    setStudentName('')
    setChatHistory([])
    setAiPhaseSync('listening')
    clearResponse()
    setIsTyping(false)
    setAnswerTimer(0)
    chatHistoryRef.current    = []
    greetingActiveRef.current = false
    isSpeakingRef.current     = false
    setIsSpeaking(false)
  }

  const embedUrl = getYtEmbedUrl(ytVideo)

  // ── Listening indicator: show when listening AND not currently speaking/responding ──
  // FIX: removed `!mimiText` — that was blocking it from showing after a response clears
  const showListening = sessionState === 'running' && aiPhase === 'listening' && !isSpeaking

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}
    >
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        {studentName && (
          <motion.div
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-semibold text-gray-700"
            style={{
              background: 'rgba(255,255,255,0.88)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(0,0,0,0.06)',
              boxShadow: '0 2px 12px rgba(0,0,0,0.08)'
            }}
          >
            <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-600 flex items-center justify-center text-xs font-bold">
              {studentName[0]?.toUpperCase()}
            </span>
            {studentName}
          </motion.div>
        )}

        {(sessionState === 'idle' || sessionState === 'stopped') && (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={startFaceDetection}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
              boxShadow: '0 4px 16px rgba(109,40,217,0.35)'
            }}
          >
            <span className="text-base">📱</span> Start Here
          </motion.button>
        )}

        {sessionState === 'running' && (
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={stopSession}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white"
            style={{
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              boxShadow: '0 4px 16px rgba(220,38,38,0.3)'
            }}
          >
            <span className="text-base">⏹</span> Stop
          </motion.button>
        )}

        {/* Status pill */}
        <div
          className="px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5"
          style={{
            background: 'rgba(255,255,255,0.88)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(0,0,0,0.06)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
            color:
              sessionState === 'running'   ? '#16a34a' :
              sessionState === 'detecting' ? '#d97706' : '#9ca3af'
          }}
        >
          <span
            className="w-1.5 h-1.5 rounded-full inline-block"
            style={{
              background:
                sessionState === 'running'   ? '#22c55e' :
                sessionState === 'detecting' ? '#f59e0b' : '#d1d5db',
              boxShadow: sessionState === 'running' ? '0 0 5px #22c55e' : 'none'
            }}
          />
          {sessionState === 'idle'      && 'Ready'}
          {sessionState === 'detecting' && 'Scanning'}
          {sessionState === 'running'   && 'Live'}
          {sessionState === 'stopped'   && 'Stopped'}
        </div>
      </div>

      {/* ── Face Detection Overlay ───────────────────────────────────────── */}
      <AnimatePresence>
        {sessionState === 'detecting' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 24 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="bg-white rounded-3xl p-7 text-center shadow-2xl max-w-md w-full mx-4"
              style={{ border: '1px solid rgba(139,92,246,0.15)' }}
            >
              <div className="relative w-full aspect-video bg-gray-50 rounded-2xl overflow-hidden mb-5 shadow-inner">
                <video ref={videoRef} autoPlay playsInline muted
                  className="w-full h-full object-cover scale-x-[-1]" />
                {/* Corner brackets */}
                {[['top-2 left-2', 'border-t-2 border-l-2'], ['top-2 right-2', 'border-t-2 border-r-2'],
                  ['bottom-2 left-2', 'border-b-2 border-l-2'], ['bottom-2 right-2', 'border-b-2 border-r-2']
                ].map(([pos, border], i) => (
                  <div key={i} className={`absolute ${pos} w-5 h-5 ${border} border-violet-400 rounded-sm`} />
                ))}
                {!webcamActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50/90">
                    <p className="text-violet-400 font-medium text-sm">Requesting camera…</p>
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-gray-800 mb-1">Who's there? 👀</h2>
              <p className="text-gray-400 text-sm mb-5">Look into the camera to be recognised</p>

              <div className="flex justify-center gap-1.5 mb-5">
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    animate={{ y: [0, -7, 0], opacity: [0.35, 1, 0.35] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.16 }}
                    className="w-2.5 h-2.5 bg-violet-500 rounded-full"
                  />
                ))}
              </div>

              <button
                onClick={() => {
                  clearInterval(facePollingRef.current)
                  facePollingRef.current = null
                  stopWebcam()
                  setSessionState('idle')
                }}
                className="text-gray-300 hover:text-red-400 transition-colors text-xs font-medium tracking-widest uppercase"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Session Stopped ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {sessionState === 'stopped' && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.85, y: 16 }} animate={{ scale: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 280, damping: 22 }}
              className="bg-white rounded-3xl px-9 py-8 text-center shadow-2xl max-w-xs w-full mx-4"
            >
              <div className="text-5xl mb-4">🎉</div>
              <h2 className="text-xl font-bold text-gray-800 mb-1.5">Session Complete!</h2>
              <p className="text-gray-400 text-sm mb-1">
                <strong className="text-violet-600">{chatHistory.length}</strong> conversations saved
              </p>
              <p className="text-gray-300 text-xs mb-6">for <strong>{studentName}</strong></p>
              <motion.button
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                onClick={resetToIdle}
                className="px-7 py-2.5 text-white font-semibold rounded-2xl text-sm"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
                  boxShadow: '0 4px 16px rgba(109,40,217,0.3)'
                }}
              >
                🔄 Start New Session
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Layout ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0 flex items-end">

        {/* ── Mimi Video ──────────────────────────────────────────────────── */}
        <div className="relative z-20 flex-shrink-0" style={{ width: '420px', height: '520px' }}>
          <AnimatePresence mode="wait">
            {sessionState === 'running' ? (
              <motion.video key="wave" src={mimiWaveVideo} autoPlay loop muted playsInline
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full object-contain"
              />
            ) : (
              <motion.video key="idle" src={mimiIdleVideo} autoPlay loop muted playsInline
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
                className="absolute inset-0 w-full h-full object-contain"
              />
            )}
          </AnimatePresence>
        </div>

        {/* ── Listening Indicator ───────────────────────────────────────────
            FIX: was `aiPhase === 'listening' && !mimiText`
            Now:  `showListening` — visible any time we're in listening phase,
            regardless of whether mimiText has been cleared yet             */}
        <AnimatePresence>
          {showListening && (
            <motion.div
              key="listening"
              initial={{ opacity: 0, scale: 0.88, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, y: 6 }}
              transition={{ duration: 0.22 }}
              className="mb-20 ml-2"
            >
              <ListeningIndicator isListening={true} />
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Generating indicator ─────────────────────────────────────────── */}
        <AnimatePresence>
          {sessionState === 'running' && aiPhase === 'generating' && (
            <motion.div
              key="generating"
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.88 }}
              transition={{ duration: 0.22 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-40"
            >
              <div
                className="flex items-center gap-3 px-5 py-3 rounded-2xl"
                style={{
                  background: 'rgba(255,255,255,0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(139,92,246,0.15)',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.1)'
                }}
              >
                <div className="flex gap-1">
                  {[0, 0.1, 0.2].map((delay, i) => (
                    <motion.div key={i}
                      animate={{ y: [0, -5, 0] }}
                      transition={{ duration: 0.45, repeat: Infinity, delay }}
                      className="w-2 h-2 rounded-full bg-violet-500"
                    />
                  ))}
                </div>
                <span className="text-sm font-semibold text-violet-700">Thinking…</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Response Box ─────────────────────────────────────────────────── */}
        <div
          className="flex-1 flex flex-col justify-end z-20 pr-5 pb-8 pl-2"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}
        >
          <AnimatePresence>
            {mimiText && sessionState === 'running' && aiPhase === 'responding' && (
              <motion.div
                key={mimiText}
                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.93)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(139,92,246,0.12)',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.1), 0 2px 8px rgba(0,0,0,0.04)'
                }}
              >
                {/* Header strip */}
                <div
                  className="px-5 pt-3.5 pb-3 flex items-center justify-between"
                  style={{ borderBottom: '1px solid rgba(139,92,246,0.08)' }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={isSpeakingRef.current ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-2 h-2 rounded-full bg-violet-500"
                    />
                    <span className="text-xs font-bold text-violet-500 tracking-wider uppercase">
                      {isSpeakingRef.current ? 'Speaking' : 'Alexi'}
                    </span>
                  </div>
                  {!isSpeakingRef.current && !isTyping && answerTimer > 0 && (
                    <span className="text-xs text-gray-300 tabular-nums">{answerTimer}s</span>
                  )}
                </div>

                {/* Text body */}
                <div className="px-5 py-4">
                  <p className="text-lg font-medium text-gray-800 leading-relaxed min-h-[44px]">
                    {displayedText}
                    {isTyping && (
                      <motion.span
                        animate={{ opacity: [1, 0, 1] }}
                        transition={{ duration: 0.65, repeat: Infinity }}
                        className="ml-0.5 text-violet-400"
                      >|</motion.span>
                    )}
                  </p>
                </div>

                {/* Image */}
                {imageUrl && (
                  <div className="px-5 pb-4">
                    <img src={imageUrl} alt="result" referrerPolicy="no-referrer"
                      className="max-h-44 mx-auto rounded-xl shadow-sm object-contain" />
                  </div>
                )}

                {/* ── YouTube — compact card ──────────────────────────────
                    FIX: constrained to 280px wide, right-aligned, not full-bleed */}
                {embedUrl && (
                  <div className="px-5 pb-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.25 }}
                      className="ml-auto"
                      style={{ width: '280px' }}
                    >
                      <div
                        className="rounded-xl overflow-hidden shadow-md"
                        style={{ aspectRatio: '16/9' }}
                      >
                        <iframe
                          key={ytPlaying ? 'playing' : 'paused'}
                          src={ytPlaying ? `${embedUrl}?autoplay=1&rel=0` : `${embedUrl}?rel=0`}
                          title="YouTube video"
                          allow="autoplay; encrypted-media; picture-in-picture"
                          allowFullScreen
                          className="w-full h-full"
                          style={{ border: 'none' }}
                        />
                      </div>
                      {!ytPlaying && (
                        <p className="text-center text-xs text-gray-400 mt-1.5">
                          Say <strong className="text-violet-500">"Alexi play video"</strong>
                        </p>
                      )}
                    </motion.div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default MimiChat