/**
 * hooks/useAudioSpeechRecorder.js
 * ─────────────────────────────────────────────────────────────
 * A robust alternative to Web Speech API. 
 * Records raw audio blobs and allows sending them to the backend for STT.
 *
 * Provides:
 *   - startRecording(onBlob) -> starts mic, stops after 6s or manual stop
 *   - stopRecording()       -> stops immediately, triggers onBlob
 *   - isRecording           -> boolean state
 *   - isSilence(blob)       -> helper to check if audio is actually speech
 */

import { useState, useRef, useCallback } from 'react';
import LOG from '../logger';

const RECORDING_TIMEOUT = 2000; // 2 seconds for activities

export function useAudioSpeechRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timeoutRef = useRef(null);

  /** 
   * Silence detection check.
   * Returns true if the audio blob's average volume is below a threshold.
   */
  const isSilence = useCallback(async (blob) => {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const data = audioBuffer.getChannelData(0);
      
      let sum = 0;
      for (let i = 0; i < data.length; i++) {
        sum += data[i] * data[i];
      }
      const rms = Math.sqrt(sum / data.length);
      audioCtx.close();
      
      LOG.info('Recorder', 'Silence check', { rms: rms.toFixed(4) });
      return rms < 0.012; // Adjusted threshold for preschool voices
    } catch (e) {
      LOG.warn('Recorder', 'isSilence check failed', e.message);
      return false; // Safely assume not silent if check fails
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      LOG.info('Recorder', 'Stopping manually');
      mediaRecorderRef.current.stop();
    }
  }, []);

  const startRecording = useCallback(async (onBlob) => {
    if (isRecording) return;
    
    LOG.info('Recorder', 'Starting recording', { timeout: RECORDING_TIMEOUT });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        setIsRecording(false);
        // Clean up stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(t => t.stop());
          streamRef.current = null;
        }
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const blob = new Blob(chunks, { type: 'audio/webm' });
        LOG.info('Recorder', 'Stopped', { size: blob.size });
        onBlob(blob);
      };

      recorder.start();
      setIsRecording(true);

      // Auto-stop after timeout
      timeoutRef.current = setTimeout(() => {
        if (recorder.state === 'recording') {
          LOG.info('Recorder', 'Auto-stopping after timeout');
          recorder.stop();
        }
      }, RECORDING_TIMEOUT);

    } catch (e) {
      LOG.error('Recorder', 'getUserMedia failed', e.message);
      setIsRecording(false);
      throw e; // Let the component handle UI error
    }
  }, [isRecording]);

  return { startRecording, stopRecording, isRecording, isSilence };
}
