// import React, { useState, useEffect, useRef } from 'react'
// import axios from 'axios'
// import { motion, AnimatePresence } from 'framer-motion'
// import { API_ENDPOINTS } from '../config'

// import bgImage from '../assets/images/mimi/bg.jpg'
// import mimiIdleVideo from '../assets/images/mimi/mimiidell_nobg.webm'
// import mimiWaveVideo from '../assets/images/mimi/mimiwavehand_nobg.webm'

// const MimiChat = () => {
//   const [sessionState, setSessionState] = useState('idle')
//   const [mimiText, setMimiText] = useState('')
//   const [imageUrl, setImageUrl] = useState(null)
//   const [ytVideo, setYtVideo] = useState(null)
//   const [playing, setPlaying] = useState(false)
//   const [displayedText, setDisplayedText] = useState('')
//   const [isTyping, setIsTyping] = useState(false)
//   // no explicit pixel shift state; we animate left/x directly

//   const pollingRef = useRef(null)

//   const startSession = async () => {
//     try {
//       await axios.get(API_ENDPOINTS.START_MIMI_SESSION)
//       setSessionState('running')
//       startPolling()
//     } catch (e) {
//       console.error(e)
//     }
//   }

//   const startPolling = () => {
//     if (pollingRef.current) return
//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await axios.get(API_ENDPOINTS.GET_MIMI_STATUS)
//         const d = res.data
//         // setMimiText(d.text)
//         // setImageUrl(d.image_url)
//         // setYtVideo(d.yt_video)
//         // setSessionState(d.action || 'idle')
//         if (d.text === "Thinking..." || !d.text) {
//             // Wait for LLM to finish
//         } else {
//             // 2. Sirf tab update karo jab naya text aaye
//             setMimiText(d.text);
//             setImageUrl(d.image_url);
//             setYtVideo(d.yt_video);
//             setSessionState(d.action || 'idle');
//         }
//         if (d.action === 'playing_video' && d.yt_video) setPlaying(true)
//       } catch (e) {
//         console.error('Mimi poll error', e)
//       }
//     }, 500)
//   }

//   // Typewriter effect: reveal mimiText progressively
//   useEffect(() => {
//     if (!mimiText) {
//       setDisplayedText('')
//       setIsTyping(false)
//       return
//     }

//     setDisplayedText('')
//     setIsTyping(true)
//     const chars = Array.from(mimiText)
//     let i = 0
//     const speed = 30 // ms per char; adjust for slower/faster
//     const t = setInterval(() => {
//       i += 1
//       setDisplayedText(chars.slice(0, i).join(''))
//       if (i >= chars.length) {
//         clearInterval(t)
//         setIsTyping(false)
//       }
//     }, speed)

//     return () => clearInterval(t)
//   }, [mimiText])

//   // Speak the full response using browser TTS once typing finishes
//   useEffect(() => {
//     if (!displayedText || isTyping) return
//     try {
//       if ('speechSynthesis' in window) {
//         window.speechSynthesis.cancel()
//         const u = new SpeechSynthesisUtterance(mimiText || displayedText)
//         u.lang = 'en-US'
//         u.rate = 0.95
//         // window.speechSynthesis.speak(u)
//       }
//     } catch (e) {
//       console.warn('Browser TTS failed', e)
//     }
//   }, [displayedText, isTyping, mimiText])

//   // no explicit shift calculation; animate left/x directly for full-left effect

//   useEffect(() => {
//     return () => {
//       if (pollingRef.current) clearInterval(pollingRef.current)
//     }
//   }, [])

//   return (
//     <div className="relative min-h-screen w-full bg-cover bg-center overflow-hidden" style={{ backgroundImage: `url(${bgImage})` }}>
//       <div className="absolute top-8 right-8 z-50 flex items-center gap-2">
//         <motion.button
//           onClick={startSession}
//           disabled={sessionState !== 'idle'}
//           className={`px-6 py-3 rounded-full text-white bg-indigo-600`}
//         >
//           {sessionState === 'idle' ? 'Start Mimi Chat' : 'Session Running'}
//         </motion.button>

//         <motion.button
//           onClick={() => {
//             // Demo response for preview
//             setSessionState('running')
//             setMimiText('The sun is big and bright. It gives us light and keeps us warm.')
//             setImageUrl('https://via.placeholder.com/600x360?text=Sun+Image')
//             setYtVideo('https://www.youtube.com/watch?v=ysz5S6PUM-U')
//             setPlaying(false)
//           }}
//           className="px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-800 shadow-sm"
//         >
//           Demo Response
//         </motion.button>
//       </div>

//       {/* Mimi video (animates left when showing a response) */}
//       <motion.div
//         className="absolute bottom-0 z-50 w-[520px] h-[520px]"
//         animate={mimiText ? { left: '12px', x: 0 } : { left: '50%', x: '-50%' }}
//         transition={{ type: 'spring', stiffness: 120, damping: 18 }}
//         style={{ position: 'absolute' }}
//       >
//         <video
//           src={mimiText ? mimiIdleVideo : (sessionState === 'running' ? mimiWaveVideo : mimiIdleVideo)}
//           autoPlay
//           loop
//           muted
//           playsInline
//           className="w-full h-full object-contain"
//         />
//       </motion.div>

//       {/* White response box */}
//       <div className="absolute top-32 left-[440px] z-40 w-[700px] pointer-events-none">
//         <AnimatePresence>
//           {(mimiText || imageUrl || ytVideo) && (
//             <motion.div
//               initial={{ opacity: 0, y: -20, scale: 0.98 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.35 }}
//               className="bg-white rounded-2xl p-6 shadow-2xl pointer-events-auto"
//             >
//               <p className="text-2xl font-semibold text-gray-800 min-h-[64px]">
//                 {displayedText}
//                 <span className={`ml-1 text-gray-700 ${isTyping ? 'animate-pulse' : ''}`}> {isTyping ? '|' : ''}</span>
//               </p>
//               {imageUrl && (
//                 <div className="mt-4">
//                   <img src={imageUrl} alt="mimi result" referrerPolicy="no-referrer" className="max-h-64 mx-auto rounded-md"  />
//                 </div>
//               )}
//               {ytVideo && (
//                 <div className="mt-4">
//                   {!playing ? (
//                     <button onClick={() => setPlaying(true)} className="px-4 py-2 bg-blue-600 text-white rounded">Play Video</button>
//                   ) : (
//                     <div className="aspect-w-16 aspect-h-9">
//                       <iframe
//                         src={`https://www.youtube.com/embed/${extractYoutubeId(ytVideo)}?autoplay=1`}
//                         title="YouTube video"
//                         allow="autoplay; encrypted-media"
//                         className="w-full h-64"
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   )
// }

// function extractYoutubeId(url) {
//   if (!url) return ''
//   const m = url.match(/(youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/)
//   return m ? m[2] : url
// }

// export default MimiChat

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
import React, { useState, useEffect, useRef, useCallback } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { API_ENDPOINTS } from '../config'

import bgImage from '../assets/images/mimi/bg.jpg'
import mimiIdleVideo from '../assets/images/mimi/mimiidell_nobg.webm'
import mimiWaveVideo from '../assets/images/mimi/mimiwavehand_nobg.webm'
// ✅ Reading book video — jo tumne bheja hai
import mimiReadingVideo from '../assets/images/mimi/mimiidell_nobg.webm'

const MimiChat = () => {

  const [sessionState, setSessionState] = useState('idle')
  const [studentName, setStudentName] = useState('')
  const [sessionId, setSessionId] = useState('')
  const [mimiText, setMimiText] = useState('')
  const [imageUrl, setImageUrl] = useState(null)
  const [ytVideo, setYtVideo] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [displayedText, setDisplayedText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false) // ← Mimi bol rahi hai?
  const [chatHistory, setChatHistory] = useState([])
  const [lastQuestion, setLastQuestion] = useState('') // ← current question track

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const [webcamActive, setWebcamActive] = useState(false)

  const pollingRef = useRef(null)
  const facePollingRef = useRef(null)
  const lastAnswerRef = useRef('')
  const lastActionRef = useRef('')
  const chatHistoryRef = useRef([])
  const mediaRecorderRef = useRef(null)
  const [isRecording, setIsRecording] = useState(false)

  useEffect(() => {
    chatHistoryRef.current = chatHistory
  }, [chatHistory])

  const generateSessionId = () =>
    `mimi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  // ── Webcam Management ─────────────────────────────────────────
  const stopWebcam = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks()
      tracks.forEach(track => track.stop())
      videoRef.current.srcObject = null
    }
    setWebcamActive(false)
  }, [])

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setWebcamActive(true)
      }
    } catch (err) {
      console.error("Webcam error:", err)
      alert("Please allow camera access for face detection.")
    }
  }

  // ── Face detection ───────────────────────────────────────────
  const startFaceDetection = useCallback(async () => {
    setSessionState('detecting')
    setStudentName('')
    setMimiText('')
    setImageUrl(null)
    setYtVideo(null)
    setChatHistory([])
    chatHistoryRef.current = []
    lastAnswerRef.current = ''
    lastActionRef.current = ''
    setLastQuestion('')

    await startWebcam()

    facePollingRef.current = setInterval(async () => {
      if (!videoRef.current || !canvasRef.current || !videoRef.current.srcObject) {
        console.log("[FaceDetect] Skipping frame: webcam not ready");
        return
      }

      try {
        const canvas = canvasRef.current
        const video = videoRef.current
        canvas.width = 320 // Small for faster upload
        canvas.height = 240
        const ctx = canvas.getContext('2d')
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
        const base64 = canvas.toDataURL('image/jpeg', 0.7)

        console.log("[FaceDetect] Sending frame to backend...");
        const res = await axios.post(API_ENDPOINTS.PROCESS_FRAME, { image: base64 })
        const data = res.data

        if (data.person) {
          console.log("[FaceDetect] RECOGNIZED:", data.person);
          const name = data.person.replace(/_/g, ' ').trim()
          clearInterval(facePollingRef.current)
          facePollingRef.current = null
          stopWebcam()
          setStudentName(name)
          startMimiSession(name)
        } else {
          console.log("[FaceDetect] No face recognized yet...");
        }
      } catch (e) { console.error('[FaceDetect] Error during frame processing:', e) }
    }, 1200) // Poll every 1s to be safe and reduce load
  }, [stopWebcam]) // eslint-disable-line

  // ── Polling ──────────────────────────────────────────────────
  const startPolling = useCallback((name, sid) => {
    if (pollingRef.current) return
    pollingRef.current = setInterval(async () => {
      try {
        const res = await axios.get(API_ENDPOINTS.GET_MIMI_STATUS)
        const d = res.data
        if (d.text && d.text !== "Thinking..." && d.text !== lastAnswerRef.current) {
          setMimiText(d.text)
          setImageUrl(d.image_url)
          setYtVideo(d.yt_video)
          lastAnswerRef.current = d.text
          setIsSpeaking(true)
        }
      } catch (e) { console.error('Mimi poll error', e) }
    }, 1000)
  }, [])

  // ── Mimi session ─────────────────────────────────────────────
  // const startMimiSession = useCallback(async (name) => {
  //   const sid = generateSessionId()
  //   setSessionId(sid)
  //   setSessionState('running')
  //   try { await axios.get(API_ENDPOINTS.START_MIMI_SESSION) }
  //   catch (e) { console.error('Mimi session start error:', e) }
  //   startPolling(name, sid)
  // }, [])
  // 

  const startMimiSession = useCallback(async (name) => {
    const sid = generateSessionId()
    setSessionId(sid)
    setSessionState('running')
    try {
      // ← GET se POST karo aur data bhejo
      await axios.post(API_ENDPOINTS.START_MIMI_SESSION, {
        student_name: name,
        session_id: sid
      })
    }
    catch (e) { console.error('Mimi session start error:', e) }
    startPolling(name, sid)
  }, []) // eslint-disable-line

  // ── Stop session ──────────────────────────────────────────────
  const stopSession = useCallback(async () => {
    // Pehle intervals band karo
    clearInterval(pollingRef.current)
    clearInterval(facePollingRef.current)
    pollingRef.current = null
    facePollingRef.current = null
    stopWebcam()

    try {
      await axios.post(API_ENDPOINTS.MIMI_STOP_SESSION)
    } catch (e) {
      console.error('Stop error:', e)
    }

    setSessionState('stopped')
    setIsSpeaking(false)
  }, [stopWebcam])

  // ── Typewriter ────────────────────────────────────────────────
  useEffect(() => {
    if (!mimiText) { setDisplayedText(''); setIsTyping(false); return }
    setDisplayedText('')
    setIsTyping(true)
    const chars = Array.from(mimiText)
    let i = 0
    const t = setInterval(() => {
      i += 1
      setDisplayedText(chars.slice(0, i).join(''))
      if (i >= chars.length) {
        clearInterval(t)
        setIsTyping(false)
        setIsSpeaking(false) // typing khatam = speaking khatam
      }
    }, 30)
    return () => clearInterval(t)
  }, [mimiText])

  // ── Audio Recording & Processing ────────────────────────────
  // const sendAudioToBackend = useCallback(async (blob) => {
  //   const formData = new FormData()
  //   formData.append('audio', blob, 'audio.webm')
  //   formData.append('student_name', studentName)
  //   formData.append('session_id', sessionId)

  //   const endpoint = (sessionState === 'idle' || sessionState === 'stopped') 
  //     ? API_ENDPOINTS.MIMI_WAKE 
  //     : API_ENDPOINTS.MIMI_CHAT_AUDIO

  //   try {
  //     const res = await axios.post(endpoint, formData)
  //     if (endpoint === API_ENDPOINTS.MIMI_WAKE && res.data.wake) {
  //       console.log("[Audio] WAKE WORD DETECTED:", res.data.text)
  //       setMimiText("Yes? I am here! Let me see who is there...")
  //       startFaceDetection()
  //     } else if (endpoint === API_ENDPOINTS.MIMI_CHAT_AUDIO && res.data.status === 'success') {
  //        console.log("[Audio] TRANSCRIBED:", res.data.text)
  //        const d = res.data.data
  //        setMimiText(d.text)
  //        setImageUrl(d.image_url)
  //        setYtVideo(d.yt_video)
  //     }
  //   } catch (e) { console.error("Audio upload error:", e) }
  // }, [studentName, sessionId, sessionState, startFaceDetection])
  const sendAudioToBackend = useCallback(async (blob) => {
    const formData = new FormData()
    formData.append('audio', blob, 'audio.webm')
    formData.append('student_name', studentName)
    formData.append('session_id', sessionId)

    const endpoint = (sessionState === 'idle' || sessionState === 'stopped')
      ? API_ENDPOINTS.MIMI_WAKE
      : API_ENDPOINTS.MIMI_CHAT_AUDIO

    try {
      const res = await axios.post(endpoint, formData)

      if (endpoint === API_ENDPOINTS.MIMI_WAKE && res.data.wake) {
        setMimiText("Yes? I am here! Let me see who is there...")
        startFaceDetection()

      } else if (endpoint === API_ENDPOINTS.MIMI_CHAT_AUDIO && res.data.status === 'success') {
        const transcribedQuestion = res.data.text
        const d = res.data.data
        setMimiText(d.text)
        setImageUrl(d.image_url)
        setYtVideo(d.yt_video)

        // DB mein save karo
        try {
          await axios.post(API_ENDPOINTS.MIMI_SAVE_CHAT, {
            student_name: studentName,
            session_id: sessionId,
            question: transcribedQuestion,
            answer: d.text,
            image_url: d.image_url || '',
          })
          console.log("[MimiChat] Chat saved ✅")
        } catch (saveErr) {
          console.error("[MimiChat] Save failed:", saveErr)
        }
      }
    } catch (e) {
      console.error("Audio upload error:", e)
    }
  }, [studentName, sessionId, sessionState, startFaceDetection])

  const startRecording = useCallback(async () => {
    if (isRecording || isSpeaking || isTyping) return
    // Don't record while detecting face
    if (sessionState === 'detecting') return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const recorder = new MediaRecorder(stream)
      const chunks = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'audio/webm' })
        sendAudioToBackend(blob)
        setIsRecording(false)
        // Clean up stream
        stream.getTracks().forEach(t => t.stop())
      }

      mediaRecorderRef.current = recorder
      recorder.start()
      setIsRecording(true)

      // Record segment (4s for wake, 6s for chat)
      const duration = (sessionState === 'idle' || sessionState === 'stopped') ? 3000 : 6000
      setTimeout(() => {
        if (recorder.state === 'recording') recorder.stop()
      }, duration)

    } catch (e) {
      console.error("Mic error:", e)
      setIsRecording(false)
    }
  }, [isRecording, isSpeaking, isTyping, sessionState, sendAudioToBackend])

  useEffect(() => {
    // This effect drives the continuous listening loop
    if (!isRecording && !isSpeaking && !isTyping && sessionState !== 'detecting') {
      const t = setTimeout(startRecording, 1000)
      return () => clearTimeout(t)
    }
  }, [isRecording, isSpeaking, isTyping, sessionState, startRecording])

  // ── Browser TTS ───────────────────────────────────────────────
  // useEffect(() => {
  //   if (!mimiText || isTyping || mimiText === "...") return
  //   if (!('speechSynthesis' in window)) return

  //   window.speechSynthesis.cancel()
  //   const u = new SpeechSynthesisUtterance(mimiText)
  //   u.lang = 'en-US'
  //   u.rate = 1.0
  //   u.onstart = () => setIsSpeaking(true)
  //   u.onend   = () => {
  //     setIsSpeaking(false)
  //   }
  //   window.speechSynthesis.speak(u)
  // }, [mimiText, isTyping])

  // ── Cleanup ───────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      clearInterval(pollingRef.current)
      clearInterval(facePollingRef.current)
      stopWebcam()
    }
  }, [stopWebcam])

  // ── Mimi ka sahi video choose karo ───────────────────────────
  const getMimiVideo = () => {
    if (sessionState !== 'running') return mimiIdleVideo
    if (isSpeaking) return mimiReadingVideo  // ← bol rahi hai = reading book
    return mimiWaveVideo                                     // ← sun rahi hai = wave
  }

  return (
    <div className="relative min-h-screen w-full bg-cover bg-center overflow-hidden"
      style={{ backgroundImage: `url(${bgImage})` }}>

      {/* Hidden canvas for capturing frames */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      {/* ── Top Bar ────────────────────────────────────────────── */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-3">
        {studentName && (
          <div className="flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full font-bold text-purple-700 shadow-lg">
            👤 {studentName}
          </div>
        )}
        {(sessionState === 'idle' || sessionState === 'stopped') && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={startFaceDetection}
            className="px-6 py-3 rounded-full text-white bg-indigo-600 font-bold shadow-lg">
            🎤 Start Mimi Chat
          </motion.button>
        )}
        {sessionState === 'running' && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={stopSession}
            className="px-6 py-3 rounded-full text-white bg-red-500 font-bold shadow-lg">
            ⏹ Stop Session
          </motion.button>
        )}
        <div className={`px-4 py-2 rounded-full text-sm font-bold ${sessionState === 'running' ? 'bg-green-100 text-green-700' :
          sessionState === 'detecting' ? 'bg-yellow-100 text-yellow-700' :
            sessionState === 'stopped' ? 'bg-gray-100 text-gray-600' :
              'bg-gray-100 text-gray-500'
          }`}>
          {sessionState === 'idle' && '⚪ Ready'}
          {sessionState === 'detecting' && '📷 Scanning...'}
          {sessionState === 'running' && '🟢 Active'}
          {sessionState === 'stopped' && '🔴 Stopped'}
        </div>
      </div>

      {/* ── Face Detection Overlay ─────────────────────────────── */}
      <AnimatePresence>
        {sessionState === 'detecting' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[2.5rem] p-8 text-center shadow-2xl max-w-lg w-full mx-4 border-4 border-purple-100">

              <div className="relative w-full aspect-video bg-gray-100 rounded-3xl overflow-hidden mb-6 shadow-inner border-2 border-purple-50">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover scale-x-[-1]" // Mirror effect
                />
                <div className="absolute inset-0 border-[3px] border-dashed border-purple-400/50 rounded-3xl pointer-events-none animate-pulse" />
                {!webcamActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50/80">
                    <p className="text-purple-400 font-bold">Requesting camera access...</p>
                  </div>
                )}
              </div>

              <h2 className="text-3xl font-black text-purple-700 mb-2">Who is there?</h2>
              <p className="text-purple-500 text-lg mb-6 tracking-wide">Align your face with the frame...</p>

              <div className="flex justify-center gap-3">
                {[0, 1, 2].map(i => (
                  <motion.div key={i}
                    animate={{ y: [0, -10, 0], opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    className="w-4 h-4 bg-purple-500 rounded-full shadow-sm" />
                ))}
              </div>

              <button
                onClick={stopSession}
                className="mt-8 text-gray-400 hover:text-red-500 transition-colors text-sm font-bold uppercase tracking-widest"
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ── Session Stopped Screen ─────────────────────────────── */}
      <AnimatePresence>
        {sessionState === 'stopped' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 z-30 flex items-center justify-center bg-black/50">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }}
              className="bg-white rounded-3xl px-12 py-10 text-center shadow-2xl max-w-md">
              <div className="text-7xl mb-4">✅</div>
              <h2 className="text-3xl font-black text-green-700 mb-2">Session Complete!</h2>
              <p className="text-gray-500 mb-2">
                <strong>{chatHistory.length}</strong> conversations saved for{' '}
                <strong>{studentName}</strong>
              </p>
              <p className="text-xs text-gray-400 mb-6">Python server is still running ✅</p>
              <button onClick={() => {
                setSessionState('idle')
                setStudentName('')
                setChatHistory([])
                setMimiText('')
                setImageUrl(null)
                setYtVideo(null)
                setIsSpeaking(false)
              }}
                className="px-8 py-3 bg-purple-600 text-white font-black rounded-2xl shadow-lg hover:bg-purple-700">
                🔄 Start New Session
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Layout: Mimi left, Response right ─────────────────── */}
      <div className="absolute inset-0 flex items-end">

        {/* ── Mimi Video — LEFT ───────────────────────────────── */}
        <div className="relative z-20 flex-shrink-0" style={{ width: '420px', height: '520px' }}>
          <video
            key={getMimiVideo()} // ← video change hone par reload ho
            src={getMimiVideo()}
            autoPlay loop muted playsInline
            className="w-full h-full object-contain" />
        </div>

        {/* ── Response Box — RIGHT ────────────────────────────── */}
        <div className="flex-1 flex flex-col justify-center z-20 pr-6 pb-8 pl-4"
          style={{ maxHeight: '90vh', overflowY: 'auto' }}>
          <AnimatePresence>
            {mimiText && (sessionState === 'running' || sessionState === 'detecting') && (
              <motion.div
                key={mimiText}
                initial={{ opacity: 0, x: 40, scale: 0.98 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.35 }}
                className="bg-white rounded-2xl p-6 shadow-2xl">

                <p className="text-2xl font-semibold text-gray-800 min-h-[64px]">
                  {displayedText}
                  {isTyping && <span className="ml-1 text-purple-500 animate-pulse">|</span>}
                </p>

                {imageUrl && (
                  <div className="mt-4">
                    <img src={imageUrl} alt="mimi result"
                      referrerPolicy="no-referrer"
                      className="max-h-52 mx-auto rounded-xl shadow-md" />
                  </div>
                )}

                {ytVideo && (
                  <div className="mt-4">
                    {!playing ? (
                      <button onClick={() => setPlaying(true)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700">
                        ▶ Play Video
                      </button>
                    ) : (
                      <iframe
                        src={`https://www.youtube.com/embed/${extractYoutubeId(ytVideo)}?autoplay=1`}
                        title="YouTube video" allow="autoplay; encrypted-media"
                        className="w-full h-52 rounded-xl" />
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Chat History Sidebar ─────────────────────────────────
      {chatHistory.length > 0 && sessionState === 'running' && (
        <div className="absolute top-24 right-6 z-40 w-64 max-h-[50vh] overflow-y-auto">
          <div className="bg-white/90 backdrop-blur rounded-2xl p-4 shadow-xl">
            <p className="font-black text-purple-700 mb-3 text-sm">
              💬 Chat History ({studentName})
            </p>
            <div className="space-y-3">
              {chatHistory.map((c, i) => (
                <div key={i} className="border-b border-purple-100 pb-2 last:border-0">
                  <p className="text-sm text-gray-700 font-medium">{c.answer}</p>
                  <p className="text-xs text-gray-400 mt-1">{c.time}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )} */}

    </div>
  )
}

function extractYoutubeId(url) {
  if (!url) return ''
  const m = url.match(/(youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/)
  return m ? m[2] : url
}

export default MimiChat

// ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// import React, { useState, useEffect, useRef } from 'react'
// import axios from 'axios'
// import { motion, AnimatePresence } from 'framer-motion'
// import { API_ENDPOINTS } from '../config'

// import bgImage from '../assets/images/mimi/bg.jpg'
// import mimiIdleVideo from '../assets/images/mimi/mimiidell_nobg.webm'
// import mimiWaveVideo from '../assets/images/mimi/mimiwavehand_nobg.webm'

// const MimiChat = () => {
//   const [sessionState, setSessionState] = useState('idle')
//   const [mimiText, setMimiText] = useState('')
//   const [imageUrl, setImageUrl] = useState(null)
//   const [ytVideo, setYtVideo] = useState(null)
//   const [playing, setPlaying] = useState(false)
//   const [displayedText, setDisplayedText] = useState('')
//   const [isTyping, setIsTyping] = useState(false)

//   const pollingRef = useRef(null)

//   const startSession = async () => {
//     try {
//       await axios.get(API_ENDPOINTS.START_MIMI_SESSION)
//       setSessionState('running')
//       startPolling()
//     } catch (e) {
//       console.error(e)
//     }
//   }

//   const startPolling = () => {
//     if (pollingRef.current) return
//     pollingRef.current = setInterval(async () => {
//       try {
//         const res = await axios.get(API_ENDPOINTS.GET_MIMI_STATUS)
//         const d = res.data

//         if (d.text === "Thinking..." || !d.text) {
//         } else {
//           setMimiText(d.text)
//           setImageUrl(d.image_url)
//           setYtVideo(d.yt_video)
//           setSessionState(d.action || 'idle')
//         }

//         if (d.action === 'playing_video' && d.yt_video) setPlaying(true)
//       } catch (e) {
//         console.error('Mimi poll error', e)
//       }
//     }, 500)
//   }

//   useEffect(() => {
//     if (!mimiText) {
//       setDisplayedText('')
//       setIsTyping(false)
//       return
//     }

//     setDisplayedText('')
//     setIsTyping(true)

//     const chars = Array.from(mimiText)
//     let i = 0
//     const speed = 30

//     const t = setInterval(() => {
//       i += 1
//       setDisplayedText(chars.slice(0, i).join(''))
//       if (i >= chars.length) {
//         clearInterval(t)
//         setIsTyping(false)
//       }
//     }, speed)

//     return () => clearInterval(t)
//   }, [mimiText])

//   useEffect(() => {
//     if (!displayedText || isTyping) return

//     try {
//       if ('speechSynthesis' in window) {
//         window.speechSynthesis.cancel()
//         const u = new SpeechSynthesisUtterance(mimiText || displayedText)
//         u.lang = 'en-US'
//         u.rate = 0.95
//       }
//     } catch (e) {
//       console.warn('Browser TTS failed', e)
//     }
//   }, [displayedText, isTyping, mimiText])

//   useEffect(() => {
//     return () => {
//       if (pollingRef.current) clearInterval(pollingRef.current)
//     }
//   }, [])

//   return (
//     <div
//       className="relative min-h-screen w-full bg-cover bg-center overflow-hidden px-4 sm:px-6"
//       style={{ backgroundImage: `url(${bgImage})` }}
//     >
//       {/* Buttons */}
//       <div className="absolute top-4 right-4 sm:top-8 sm:right-8 z-50 flex flex-wrap gap-2">
//         <motion.button
//           onClick={startSession}
//           disabled={sessionState !== 'idle'}
//           className="px-4 sm:px-6 py-2 sm:py-3 rounded-full text-white bg-indigo-600 text-sm sm:text-base"
//         >
//           {sessionState === 'idle' ? 'Start Mimi Chat' : 'Session Running'}
//         </motion.button>

//         <motion.button
//           onClick={() => {
//             setSessionState('running')
//             setMimiText('The sun is big and bright. It gives us light and keeps us warm.')
//             setImageUrl('https://via.placeholder.com/600x360?text=Sun+Image')
//             setYtVideo('https://www.youtube.com/watch?v=ysz5S6PUM-U')
//             setPlaying(false)
//           }}
//           className="px-3 sm:px-4 py-2 rounded-full bg-white border border-gray-200 text-gray-800 shadow-sm text-sm"
//         >
//           Demo Response
//         </motion.button>
//       </div>

//       {/* Mimi Character */}
//       <motion.div
//         className="absolute bottom-0 z-50
//         w-[220px] h-[220px]
//         sm:w-[300px] sm:h-[300px]
//         md:w-[380px] md:h-[380px]
//         lg:w-[450px] lg:h-[450px]
//         xl:w-[520px] xl:h-[520px]"
//         animate={mimiText ? { left: '10px', x: 0 } : { left: '50%', x: '-50%' }}
//         transition={{ type: 'spring', stiffness: 120, damping: 18 }}
//       >
//         <video
//           src={mimiText ? mimiIdleVideo : (sessionState === 'running' ? mimiWaveVideo : mimiIdleVideo)}
//           autoPlay
//           loop
//           muted
//           playsInline
//           className="w-full h-full object-contain"
//         />
//       </motion.div>

//       {/* Response Box */}
//       <div className="
//         absolute z-40 pointer-events-none
//         top-20
//         left-1/2 -translate-x-1/2
//         w-[95%]
//         sm:w-[85%]
//         md:w-[70%]
//         lg:w-[600px]
//         xl:w-[700px]
//         md:left-[380px] md:translate-x-0
//         lg:left-[420px]
//       ">
//         <AnimatePresence>
//           {(mimiText || imageUrl || ytVideo) && (
//             <motion.div
//               initial={{ opacity: 0, y: -20, scale: 0.98 }}
//               animate={{ opacity: 1, y: 0, scale: 1 }}
//               exit={{ opacity: 0, y: -10 }}
//               transition={{ duration: 0.35 }}
//               className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl pointer-events-auto"
//             >
//               <p className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 min-h-[64px]">
//                 {displayedText}
//                 <span className={`ml-1 text-gray-700 ${isTyping ? 'animate-pulse' : ''}`}>
//                   {isTyping ? '|' : ''}
//                 </span>
//               </p>

//               {imageUrl && (
//                 <div className="mt-4">
//                   <img
//                     src={imageUrl}
//                     alt="mimi result"
//                     referrerPolicy="no-referrer"
//                     className="max-h-64 w-full object-contain mx-auto rounded-md"
//                   />
//                 </div>
//               )}

//               {ytVideo && (
//                 <div className="mt-4">
//                   {!playing ? (
//                     <button
//                       onClick={() => setPlaying(true)}
//                       className="px-4 py-2 bg-blue-600 text-white rounded"
//                     >
//                       Play Video
//                     </button>
//                   ) : (
//                     <div className="w-full aspect-video">
//                       <iframe
//                         src={`https://www.youtube.com/embed/${extractYoutubeId(ytVideo)}?autoplay=1`}
//                         title="YouTube video"
//                         allow="autoplay; encrypted-media"
//                         className="w-full h-full rounded"
//                       />
//                     </div>
//                   )}
//                 </div>
//               )}
//             </motion.div>
//           )}
//         </AnimatePresence>
//       </div>
//     </div>
//   )
// }

// function extractYoutubeId(url) {
//   if (!url) return ''
//   const m = url.match(/(youtu\.be\/|v=|embed\/)([A-Za-z0-9_-]{6,})/)
//   return m ? m[2] : url
// }

// export default MimiChat;
