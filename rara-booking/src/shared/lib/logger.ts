/** Simple logger that's silent in production */
const isDev = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: unknown[]) => { if (isDev) console.log('[rara]', ...args); },
  warn: (...args: unknown[]) => { if (isDev) console.warn('[rara]', ...args); },
  error: (...args: unknown[]) => { console.error('[rara]', ...args); },
};
