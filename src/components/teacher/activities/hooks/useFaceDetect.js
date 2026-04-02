/**
 * hooks/useFaceDetect.js
 * ─────────────────────────────────────────────────────────────
 * Manages the full camera lifecycle for face detection:
 *   - Opens getUserMedia stream
 *   - Attaches it to a <video> ref for live preview
 *   - Polls the face-detect API every 1200ms
 *   - Calls onRecognized(name) exactly once per scan session
 *   - Stops and cleans up the stream on unmount or explicit stop
 *
 * Double-fire prevention:
 *   recognizedRef is set to true BEFORE clearInterval(), so any
 *   in-flight concurrent callback is blocked by the guard at the
 *   top of the poll function.
 *
 * Logs to look for:
 *   [LOG][Camera] Stream opened         → getUserMedia latency
 *   [LOG][Camera] Live preview attached → <video> received stream
 *   [LOG][FaceDetect] Response          → per-frame API latency
 *   [LOG][FaceDetect] Recognized!       → name, triggers intro
 *   [LOG][FaceDetect] Already seen      → name in seenSet, skipped
 *   [WARN][Camera] getUserMedia failed  → browser denied permission
 */

import { useRef, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../../config';
import LOG from '../logger';

export function useFaceDetect({ mountedRef, phaseRef, liveVideoRef, seenRef }) {
  const pollRef         = useRef(null);
  const cameraStreamRef = useRef(null);
  const recognizedRef   = useRef(false); // prevents double-fire

  /* ── stopCamera ────────────────────────────────────────────── */
  const stopCamera = useCallback(() => {
    clearInterval(pollRef.current);
    pollRef.current = null;

    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
      LOG.info('Camera', 'Stream stopped and tracks released');
    }
    if (liveVideoRef.current) {
      liveVideoRef.current.srcObject = null;
    }
  }, [liveVideoRef]);

  /* ── resetRecognized ───────────────────────────────────────── */
  /** Call before starting a new student scan. */
  const resetRecognized = useCallback(() => {
    recognizedRef.current = false;
    LOG.info('Camera', 'recognizedRef reset for next student scan');
  }, []);

  /* ── startCameraPoll ───────────────────────────────────────── */
  /**
   * @param {function} onRecognized  Called with (name: string) exactly once
   */
  const startCameraPoll = useCallback((onRecognized) => {
    // Stop any previous scan before starting a new one
    stopCamera();
    recognizedRef.current = false;

    LOG.info('Camera', 'Requesting getUserMedia stream');
    const doneStream = LOG.time('Camera stream open');

    navigator.mediaDevices
      .getUserMedia({ video: { width: 320, height: 240, facingMode: 'user' } })
      .then(stream => {
        doneStream();
        if (!mountedRef.current) {
          stream.getTracks().forEach(t => t.stop());
          LOG.warn('Camera', 'Component unmounted before stream opened — releasing');
          return;
        }

        cameraStreamRef.current = stream;

        // ── Attach to live preview <video> ─────────────────────
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
          liveVideoRef.current.play().catch(e =>
            LOG.warn('Camera', 'Preview play() rejected', e.message)
          );
          LOG.info('Camera', 'Live preview attached to <video>');
        } else {
          LOG.warn('Camera', 'liveVideoRef is null — preview will not show');
        }

        // ── Hidden video element for canvas capture ────────────
        const vidEl    = document.createElement('video');
        const canvasEl = document.createElement('canvas');
        vidEl.srcObject = stream;
        vidEl.play();

        LOG.info('Camera', 'Face-detect poll starting (interval 1200ms)');

        pollRef.current = setInterval(async () => {
          // Guard: skip if phase changed or already recognized
          if (phaseRef.current !== 'waiting' || recognizedRef.current) return;

          const doneFrame = LOG.time('Face detect API round-trip');
          try {
            canvasEl.width  = 320;
            canvasEl.height = 240;
            canvasEl.getContext('2d').drawImage(vidEl, 0, 0, 320, 240);
            const base64 = canvasEl.toDataURL('image/jpeg', 0.7);

            const res  = await axios.post(API_ENDPOINTS.PROCESS_FRAME, { image: base64 });
            doneFrame({ person: res.data?.person || 'none' });

            const person = res.data?.person;
            if (!person) return;

            const name = person.replace(/_/g, ' ').trim();

            if (seenRef.current.has(name.toLowerCase())) {
              LOG.info('FaceDetect', 'Already seen this session — skipping', name);
              return;
            }

            // ── Recognized ────────────────────────────────────
            recognizedRef.current = true; // set BEFORE clearInterval
            clearInterval(pollRef.current);
            pollRef.current = null;

            // Stop camera tracks now — preview no longer needed
            stream.getTracks().forEach(t => t.stop());
            cameraStreamRef.current = null;
            if (liveVideoRef.current) liveVideoRef.current.srcObject = null;

            LOG.info('FaceDetect', '✅ Recognized!', { name });

            if (mountedRef.current) onRecognized(name);

          } catch (e) {
            // Non-fatal — next interval tick will retry
            LOG.warn('FaceDetect', 'Frame API error', e.message);
          }
        }, 1200);
      })
      .catch(e => {
        LOG.error('Camera', 'getUserMedia failed', e.message);
      });
  }, [mountedRef, phaseRef, liveVideoRef, seenRef, stopCamera]);

  return { startCameraPoll, stopCamera, resetRecognized, pollRef, cameraStreamRef };
}
