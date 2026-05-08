// src/hooks/useAutoVideoRecording.js
// ─────────────────────────────────────────────────────────────────────────────
// AUTO VIDEO RECORDING HOOK — Automatically records teacher sessions
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef } from 'react';
import { useVideoRecording } from './useVideoRecording';
import { showToast } from '../utils/toast';

export const useAutoVideoRecording = ({ 
  sessionState, 
  studentId, 
  studentName, 
  sessionType = 'chat',
  mode = 'teacher', // Accept mode instead of isTeacherMode
  autoSendToParent = true 
}) => {
  const {
    isRecording,
    startRecording,
    stopRecording,
    isSupported
  } = useVideoRecording();

  const recordingStartedRef = useRef(false);
  const sessionStateRef = useRef(sessionState);

  // Auto-record for both teachers and parents, but NOT admins
  const shouldAutoRecord = mode === 'teacher' || mode === 'parent';

  // Update ref when sessionState changes
  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  // Auto start/stop recording based on session state
  useEffect(() => {
    // Only auto-record for teachers/parents and if browser supports it
    if (!shouldAutoRecord || !isSupported) return;
    
    // Session started - begin recording
    if (sessionState === 'running' && !recordingStartedRef.current && studentId && studentName) {
      const startAutoRecording = async () => {
        try {
          const success = await startRecording({
            studentId,
            studentName,
            sessionType,
            sendToParent: autoSendToParent
          });
          
          if (success) {
            recordingStartedRef.current = true;
            showToast.success(`🎥 Auto-recording started for ${studentName}'s ${sessionType} session`);
          } else {
            showToast.warning('Failed to start auto-recording. Please start manually.');
          }
        } catch (error) {
          console.error('Auto-recording start failed:', error);
          showToast.error('Auto-recording failed to start');
        }
      };

      // Small delay to ensure session is fully initialized
      setTimeout(startAutoRecording, 1000);
    }
    
    // Session ended - stop recording
    if ((sessionState === 'stopped' || sessionState === 'idle') && recordingStartedRef.current && isRecording) {
      const stopAutoRecording = async () => {
        try {
          await stopRecording();
          recordingStartedRef.current = false;
          showToast.success(`📹 Session recording completed and sent to ${studentName}'s parent`);
        } catch (error) {
          console.error('Auto-recording stop failed:', error);
          showToast.warning('Recording stopped but may not have been saved properly');
        }
      };

      stopAutoRecording();
    }
  }, [sessionState, studentId, studentName, sessionType, shouldAutoRecord, isSupported, autoSendToParent, startRecording, stopRecording, isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recordingStartedRef.current && isRecording) {
        stopRecording();
        recordingStartedRef.current = false;
      }
    };
  }, []);

  return {
    isAutoRecording: recordingStartedRef.current && isRecording,
    isSupported,
    canAutoRecord: shouldAutoRecord && isSupported
  };
};