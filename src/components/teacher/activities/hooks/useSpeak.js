/**
 * hooks/useSpeak.js
 * ─────────────────────────────────────────────────────────────
 * Encapsulates all Text-To-Speech logic:
 *   - speak(text)        → plays audio, awaitable
 *   - cancelSpeech()     → stops current playback immediately
 *   - prefetchTTS(text)  → fires API call in background, caches result
 *
 * Performance features:
 *   • Prefetch cache: if speak() is called for a text that was
 *     previously prefetched, the API call is skipped entirely —
 *     saving 4–13 seconds of TTS latency observed in prod logs.
 *   • All timings logged: API call ms, audio playback ms, cache hits.
 *   • playbackRate = 1.25 to keep the session feeling snappy.
 *
 * Logs to look for:
 *   [LOG][Speak] Cache HIT          → prefetch worked, ~0ms wait
 *   [LOG][Speak] API response       → cache missed, shows API latency
 *   [LOG][Speak] Ended              → shows total playback time
 *   [LOG][Prefetch] Cached          → background fetch succeeded
 *   [WARN][Prefetch] Failed         → background fetch failed (non-fatal)
 */

import { useRef, useCallback } from 'react';
import axios from 'axios';
import { API_ENDPOINTS } from '../../../../config';
import LOG from '../logger';

export function useSpeak(mountedRef) {
  const currentAudioRef = useRef(null);
  const prefetchRef     = useRef(null); // { text: string, audio: base64string }

  /* ── Internal: decode base64 audio and play it ─────────────── */
  const _playBase64 = useCallback(async (audioData, t0) => {
    const bytes = atob(audioData);
    const buf   = new ArrayBuffer(bytes.length);
    const arr   = new Uint8Array(buf);
    for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);

    const url   = URL.createObjectURL(new Blob([arr], { type: 'audio/mpeg' }));
    const audio = new Audio(url);
    audio.setAttribute('playsinline', '');
    audio.setAttribute('webkit-playsinline', '');
    audio.playbackRate = 1.25;
    currentAudioRef.current = audio;

    await new Promise(resolve => {
      audio.onended = () => {
        LOG.info('Speak', 'Ended', { totalMs: Date.now() - t0 });
        if (currentAudioRef.current === audio) currentAudioRef.current = null;
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.onerror = () => {
        LOG.warn('Speak', 'Audio element error');
        if (currentAudioRef.current === audio) currentAudioRef.current = null;
        URL.revokeObjectURL(url);
        resolve();
      };
      audio.play().catch(e => {
        LOG.warn('Speak', 'play() rejected', e.message);
        if (currentAudioRef.current === audio) currentAudioRef.current = null;
        URL.revokeObjectURL(url);
        resolve();
      });
    });
  }, []);

  /* ── cancelSpeech ──────────────────────────────────────────── */
  const cancelSpeech = useCallback(() => {
    if (currentAudioRef.current) {
      LOG.info('Speech', 'Cancelled mid-playback');
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }
  }, []);

  /* ── speak ─────────────────────────────────────────────────── */
  const speak = useCallback(async (text) => {
    if (!text || !mountedRef.current) return;

    const t0 = Date.now();
    LOG.info('Speak', 'Start', { text: text.slice(0, 70) });

    // Stop any currently playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
      currentAudioRef.current = null;
    }

    let audioData = null;

    // ── Cache hit: use prefetched audio ───────────────────────
    if (prefetchRef.current?.text === text) {
      audioData = prefetchRef.current.audio;
      prefetchRef.current = null;
      LOG.info('Speak', '✅ Cache HIT — API call skipped', {
        text: text.slice(0, 50),
        savedApproxMs: '4000–13000',
      });
    } else {
      // ── Cache miss: call TTS API ──────────────────────────
      if (prefetchRef.current) {
        LOG.warn('Speak', '⚠️ Cache MISS — had cached different text', {
          wanted: text.slice(0, 40),
          had: prefetchRef.current.text.slice(0, 40),
        });
        prefetchRef.current = null;
      } else {
        LOG.info('Speak', 'Cache empty — calling TTS API');
      }

      try {
        const res = await axios.post(API_ENDPOINTS.SPEAK, { text });
        LOG.info('Speak', 'API response received', {
          apiMs: Date.now() - t0,
          hasAudio: !!res.data?.audio,
        });
        audioData = res.data?.audio;
      } catch (e) {
        LOG.error('Speak', 'TTS API call failed', e.message);
        return;
      }
    }

    if (audioData && mountedRef.current) {
      await _playBase64(audioData, t0);
    }
  }, [mountedRef, _playBase64]);

  /* ── prefetchTTS ────────────────────────────────────────────── */
  /**
   * Fire a TTS API call in the background and cache the result.
   * Call this as soon as you know what the next spoken text will be.
   * speak() will use the cache instead of calling the API again.
   *
   * @param {string} text  The text to pre-warm
   * @param {string} label A label for log identification
   */
  const prefetchTTS = useCallback((text, label = '') => {
    if (!text || !mountedRef.current) return;
    if (prefetchRef.current?.text === text) {
      LOG.info('Prefetch', 'Already cached, skipping', { text: text.slice(0, 40) });
      return;
    }

    const t0 = Date.now();
    LOG.info('Prefetch', `Firing background TTS [${label}]`, { text: text.slice(0, 50) });

    axios.post(API_ENDPOINTS.SPEAK, { text })
      .then(res => {
        if (!mountedRef.current) return;
        if (res.data?.audio) {
          prefetchRef.current = { text, audio: res.data.audio };
          LOG.info('Prefetch', `✅ Cached [${label}]`, {
            ms: Date.now() - t0,
            text: text.slice(0, 50),
          });
        } else {
          LOG.warn('Prefetch', 'API returned no audio', { label });
        }
      })
      .catch(e => {
        LOG.warn('Prefetch', `Failed [${label}]`, e.message);
      });
  }, [mountedRef]);

  /* ── clearPrefetch ─────────────────────────────────────────── */
  const clearPrefetch = useCallback(() => {
    if (prefetchRef.current) {
      LOG.info('Prefetch', 'Cleared stale cache');
      prefetchRef.current = null;
    }
  }, []);

  return { speak, cancelSpeech, prefetchTTS, clearPrefetch };
}
