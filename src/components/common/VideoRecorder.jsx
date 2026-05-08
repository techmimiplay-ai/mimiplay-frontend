// src/components/common/VideoRecorder.jsx
// ─────────────────────────────────────────────────────────────────────────────
// VIDEO RECORDER COMPONENT — Controls for session recording
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Square, Pause, Play, Send, Settings } from 'lucide-react';
import { useVideoRecording } from '../../hooks/useVideoRecording';
import { Button } from '../shared';

const VideoRecorder = ({ 
  studentId, 
  studentName, 
  sessionType = 'chat',
  autoSendToParent = true,
  className = '' 
}) => {
  const {
    isRecording,
    isPaused,
    isProcessing,
    recordingDuration,
    isSupported,
    startRecording,
    stopRecording,
    togglePause,
    sendVideoToParent
  } = useVideoRecording();

  const [showSettings, setShowSettings] = useState(false);
  const [recordingOptions, setRecordingOptions] = useState({
    sendToParent: autoSendToParent,
    quality: 'high'
  });

  const handleStartRecording = async () => {
    const success = await startRecording({
      studentId,
      studentName,
      sessionType,
      sendToParent: recordingOptions.sendToParent
    });
    
    if (success) {
      setShowSettings(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
        <p className="text-yellow-800">
          📱 Video recording not supported in this browser. 
          Please use Chrome, Firefox, or Edge for recording features.
        </p>
      </div>
    );
  }

  return (
    <div className={`video-recorder ${className}`}>
      {/* Recording Status Bar */}
      <AnimatePresence>
        {isRecording && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2"
          >
            <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
            <span className="font-semibold">REC {recordingDuration}</span>
            {isPaused && <span className="text-red-200">(PAUSED)</span>}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Control Panel */}
      <div className="flex items-center gap-2">
        {!isRecording ? (
          <>
            <Button
              variant="primary"
              size="sm"
              icon={Video}
              onClick={handleStartRecording}
              disabled={isProcessing}
              className="bg-red-500 hover:bg-red-600"
            >
              {isProcessing ? 'Processing...' : 'Start Recording'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              icon={Settings}
              onClick={() => setShowSettings(!showSettings)}
            >
              Settings
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="outline"
              size="sm"
              icon={isPaused ? Play : Pause}
              onClick={togglePause}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
            
            <Button
              variant="primary"
              size="sm"
              icon={Square}
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700"
            >
              Stop & Save
            </Button>
            
            <div className="text-sm text-gray-600 font-mono">
              {recordingDuration}
            </div>
          </>
        )}
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && !isRecording && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute top-full mt-2 left-0 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[280px] z-10"
          >
            <h4 className="font-semibold text-gray-800 mb-3">Recording Settings</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm text-gray-700">Send to Parent</label>
                <input
                  type="checkbox"
                  checked={recordingOptions.sendToParent}
                  onChange={(e) => setRecordingOptions(prev => ({
                    ...prev,
                    sendToParent: e.target.checked
                  }))}
                  className="rounded"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-700 block mb-1">Quality</label>
                <select
                  value={recordingOptions.quality}
                  onChange={(e) => setRecordingOptions(prev => ({
                    ...prev,
                    quality: e.target.value
                  }))}
                  className="w-full text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value="high">High (1080p)</option>
                  <option value="medium">Medium (720p)</option>
                  <option value="low">Low (480p)</option>
                </select>
              </div>
              
              <div className="text-xs text-gray-500 mt-2">
                💡 <strong>Tip:</strong> Keep this browser tab active during recording for best quality.
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Processing Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-lg p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="font-semibold">Processing Video...</p>
              <p className="text-sm text-gray-600 mt-1">This may take a few moments</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VideoRecorder;