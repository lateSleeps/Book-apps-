const getNodeEnv = () => {
  if (typeof process !== 'undefined' && process.env) {
    return process.env.NODE_ENV;
  }
  return undefined;
};

const isDev = typeof window === 'undefined' || getNodeEnv() === 'development';

const logStyles = {
  debug: 'color: #999;',
  info: 'color: #0066cc;',
  warn: 'color: #ff9900;',
  error: 'color: #cc0000;',
};

/**
 * Logger utility for consistent logging across the application
 * Respects NODE_ENV and only logs in development
 */
export const logger = {
  debug: (message: string, data?: any) => {
    if (isDev) {
      if (data) {
        console.log(`%c[DEBUG] ${message}`, logStyles.debug, data);
      } else {
        console.log(`%c[DEBUG] ${message}`, logStyles.debug);
      }
    }
  },

  info: (message: string, data?: any) => {
    if (isDev) {
      if (data) {
        console.log(`%c[INFO] ${message}`, logStyles.info, data);
      } else {
        console.log(`%c[INFO] ${message}`, logStyles.info);
      }
    }
  },

  warn: (message: string, data?: any) => {
    if (data) {
      console.warn(`[WARN] ${message}`, data);
    } else {
      console.warn(`[WARN] ${message}`);
    }
  },

  error: (message: string, error?: Error | any) => {
    if (error instanceof Error) {
      console.error(`[ERROR] ${message}`, {
        message: error.message,
        stack: error.stack,
      });
    } else if (error) {
      console.error(`[ERROR] ${message}`, error);
    } else {
      console.error(`[ERROR] ${message}`);
    }
  },
};
