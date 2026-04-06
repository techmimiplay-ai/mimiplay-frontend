/**
 * hooks/useSpeechRecognition.js
 * ─────────────────────────────────────────────────────────────
 * Wraps the Web SpeechRecognition API for the listening phase.
 *
 * Returns a single function: startListening({ answer, onResult, onTimeout })
 *   - Starts a 7-second listening window
 *   - Calls onResult(transcript) when speech is detected
 *   - Calls onTimeout() if no speech heard within 7s
 *   - Returns a cleanup function that stops the recognizer
 *
 * Also returns:
 *   - isSupported   boolean — false on browsers without SR
 *   - controlWords  function — detects pause/resume/stop commands
 *
 * Logs to look for:
 *   [LOG][SR] Started             → mic opened, timer started
 *   [LOG][SR] Got result          → transcript + latency from start
 *   [LOG][SR] onend (no result)   → user said nothing / mic timeout
 *   [WARN][SR] Error              → browser SR error code
 *   [WARN][SR] start() failed     → likely already open
 */

import { useCallback } from 'react';
import LOG from '../logger';

const SR_LANG    = 'en-IN';
const SR_TIMEOUT = 7000; // ms to wait before treating as no-answer

export function useSpeechRecognition() {
  const isSupported = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  /** Detect voice control commands (pause/resume/stop Alexi). */
  const checkForControlWord = useCallback((text) => {
    const t = (text || '').toLowerCase().trim();
    if (!t) return null;
    const hasAlexi = t.includes('alexi') || t.includes('alexa');
    if (!hasAlexi) return null;
    if (t.includes('pause'))                        return 'pause';
    if (t.includes('resume'))                       return 'resume';
    if (t.includes('stop') || t.includes('bye'))   return 'stop';
    return null;
  }, []);

  /**
   * Start a one-shot listening session.
   *
   * @param {object} opts
   * @param {string}   opts.answer     The correct answer (for logging only)
   * @param {function} opts.onResult   Called with (transcript: string)
   * @param {function} opts.onTimeout  Called if nothing heard in SR_TIMEOUT ms
   * @param {function} opts.onControl  Called with ('pause'|'resume'|'stop') for voice cmds
   * @returns {function} cleanup — call to cancel listening early
   */
  const startListening = useCallback(({ answer, onResult, onTimeout, onControl }) => {
    if (!isSupported) {
      LOG.warn('SR', 'SpeechRecognition not supported in this browser');
      const t = setTimeout(onTimeout, 3000);
      return () => clearTimeout(t);
    }

    const SR  = window.SpeechRecognition || window.webkitSpeechRecognition;
    const rec = new SR();
    rec.lang            = SR_LANG;
    rec.continuous      = false;
    rec.interimResults  = false;

    let answered  = false;
    let cancelled = false;
    const listenStart = Date.now();

    const finish = () => {
      clearTimeout(timeoutId);
      rec.onresult = null;
      rec.onend    = null;
      rec.onerror  = null;
      try { rec.stop(); } catch {}
    };

    rec.onstart = () => {
      LOG.info('SR', 'Started — waiting for speech', {
        answer,
        timeoutMs: SR_TIMEOUT,
      });
    };

    rec.onresult = e => {
      if (cancelled || answered) return;
      const transcript = e.results[0][0].transcript.trim();
      const confidence = e.results[0][0].confidence;
      LOG.info('SR', 'Got result', {
        transcript,
        confidence: confidence?.toFixed(2),
        latencyMs: Date.now() - listenStart,
      });

      answered = true;
      finish();

      const cmd = checkForControlWord(transcript);
      if (cmd) { onControl?.(cmd); return; }
      onResult(transcript);
    };

    rec.onend = () => {
      if (cancelled || answered) return;
      LOG.info('SR', 'onend — no result received', { latencyMs: Date.now() - listenStart });
      answered = true;
      finish();
      onTimeout();
    };

    rec.onerror = e => {
      LOG.warn('SR', 'Recognition error', { error: e.error, latencyMs: Date.now() - listenStart });
      if (cancelled || answered) return;
      answered = true;
      finish();
      onTimeout();
    };

    const timeoutId = setTimeout(() => {
      if (answered || cancelled) return;
      LOG.warn('SR', `${SR_TIMEOUT}ms timeout reached — treating as no answer`);
      answered = true;
      finish();
      onTimeout();
    }, SR_TIMEOUT);

    try {
      rec.start();
    } catch (e) {
      LOG.warn('SR', 'start() threw', e.message);
      clearTimeout(timeoutId);
      onTimeout();
    }

    // Return cleanup function
    return () => {
      cancelled = true;
      finish();
      LOG.info('SR', 'Listening cancelled by cleanup');
    };
  }, [isSupported, checkForControlWord]);

  return { startListening, checkForControlWord, isSupported };
}
