/**
 * logger.js
 * ─────────────────────────────────────────────────────────────
 * Shared structured logger for the Activities system.
 *
 * Every log line is tagged with:
 *   [LOG|WARN|ERR][+elapsed_ms][TAG] message  data
 *
 * The elapsed_ms counter resets when the module is first loaded
 * (i.e. when the app boots), giving you a session-relative timeline
 * you can paste straight into a spreadsheet to find bottlenecks.
 *
 * Usage:
 *   import LOG from '../logger';
 *   LOG.info('Camera', 'Stream opened', { ms: 230 });
 *   const done = LOG.time('Face detect round-trip');
 *   // ...async work...
 *   done(); // prints "[LOG][+1234ms][TIMING] Face detect round-trip took 412ms"
 */

const _start = Date.now();

const LOG = {
  _ts:   ()            => `+${Date.now() - _start}ms`,
  info:  (tag, msg, d) => console.log (`[LOG] [${LOG._ts()}] [${tag}]`, msg, d ?? ''),
  warn:  (tag, msg, d) => console.warn(`[WARN][${LOG._ts()}] [${tag}]`, msg, d ?? ''),
  error: (tag, msg, d) => console.error(`[ERR] [${LOG._ts()}] [${tag}]`, msg, d ?? ''),

  /**
   * Returns a "stop" function. Call it when the timed work finishes.
   * Prints the label and elapsed ms automatically.
   */
  time: (label) => {
    const t0 = Date.now();
    LOG.info('TIMING', `${label} — started`);
    return (extra) =>
      LOG.info('TIMING', `${label} — done in ${Date.now() - t0}ms`, extra ?? '');
  },

  /**
   * Logs a named phase transition for the activity state machine.
   * Makes it trivial to trace the full flow in the console.
   */
  phase: (from, to, data) =>
    LOG.info('PHASE', `${from} → ${to}`, data ?? ''),

  /**
   * Logs a render / mount event. Lets you spot unexpected re-mounts.
   */
  render: (component, reason) =>
    LOG.info('RENDER', `<${component}> ${reason ?? 'mounted/updated'}`),
};

export default LOG;
