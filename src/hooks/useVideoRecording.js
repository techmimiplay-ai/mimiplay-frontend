// src/hooks/useVideoRecording.js
// ─────────────────────────────────────────────────────────────────────────────
// VIDEO RECORDING HOOK — Record student sessions for parent sharing
// ─────────────────────────────────────────────────────────────────────────────
import { useState, useRef, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS, getAuthHeaders } from '../config';
import { showToast } from '../utils/toast';

export const useVideoRecording = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  // Start recording the current screen/tab
  const startRecording = useCallback(async (options = {}) => {
    try {
      // Request screen capture with audio
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          mediaSource: 'screen',
          width: { ideal: 1920, max: 1920 },
          height: { ideal: 1080, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;
      chunksRef.current = [];

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9,opus' // High quality codec
      });

      mediaRecorderRef.current = mediaRecorder;

      // Handle data chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        await handleRecordingComplete(blob, options);
      };

      // Handle stream end (user stops sharing)
      stream.getVideoTracks()[0].onended = () => {
        if (isRecording) {
          stopRecording();
        }
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      startTimeRef.current = Date.now();
      
      // Start duration timer
      timerRef.current = setInterval(() => {
        setRecordingDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      showToast.success('🎥 Recording started! Make sure to keep this tab active.');
      return true;

    } catch (error) {
      console.error('Failed to start recording:', error);
      showToast.error('Failed to start recording. Please allow screen sharing.');
      return false;
    }
  }, [isRecording]);

  // Stop recording
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      
      // Stop all tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      
      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      setIsRecording(false);
      setIsPaused(false);
      showToast.info('🎬 Recording stopped. Processing video...');
    }
  }, [isRecording]);

  // Pause/Resume recording
  const togglePause = useCallback(() => {
    if (mediaRecorderRef.current) {
      if (isPaused) {
        mediaRecorderRef.current.resume();
        setIsPaused(false);
        showToast.info('▶️ Recording resumed');
      } else {
        mediaRecorderRef.current.pause();
        setIsPaused(true);
        showToast.info('⏸️ Recording paused');
      }
    }
  }, [isPaused]);

  // Handle completed recording
  const handleRecordingComplete = async (videoBlob, options) => {
    try {
      setIsProcessing(true);
      
      // Create form data for upload
      const formData = new FormData();
      const filename = `session-${options.studentId || 'unknown'}-${Date.now()}.webm`;
      formData.append('video', videoBlob, filename);
      formData.append('student_id', options.studentId || '');
      formData.append('student_name', options.studentName || '');
      formData.append('session_type', options.sessionType || 'chat');
      formData.append('duration', recordingDuration);
      formData.append('recorded_at', new Date().toISOString());

      // Upload to backend
      const uploadRes = await axios.post(
        API_ENDPOINTS.UPLOAD_SESSION_VIDEO,
        formData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      const response = uploadRes.data;

      if (response.status === 'success') {
        showToast.success('✅ Video saved successfully!');
        
        // Optionally send to parent via WhatsApp
        if (options.sendToParent) {
          await sendVideoToParent(response.video_id, options.studentName);
        }
        
        return response.video_id;
      } else {
        throw new Error(response.message || 'Upload failed');
      }

    } catch (error) {
      console.error('Failed to save recording:', error);
      showToast.error('❌ Failed to save video. Please try again.');
      return null;
    } finally {
      setIsProcessing(false);
      setRecordingDuration(0);
    }
  };

  // Send video to parent via WhatsApp
  const sendVideoToParent = async (videoId, studentName) => {
    try {
      await axios.post(
        API_ENDPOINTS.SEND_VIDEO_TO_PARENT,
        { video_id: videoId, student_name: studentName },
        { headers: getAuthHeaders() }
      );
      showToast.success(`📱 Video sent to ${studentName}'s parent via WhatsApp!`);
    } catch (error) {
      console.error('Failed to send video to parent:', error);
      showToast.warning('Video saved but failed to send to parent');
    }
  };

  // Format duration for display
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Check if recording is supported
  const isSupported = () => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia);
  };

  return {
    // State
    isRecording,
    isPaused,
    isProcessing,
    recordingDuration: formatDuration(recordingDuration),
    isSupported: isSupported(),
    
    // Actions
    startRecording,
    stopRecording,
    togglePause,
    sendVideoToParent
  };
};