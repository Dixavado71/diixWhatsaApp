import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  }
});

/**
 * Log application events
 */
export const appLogger = {
  info: (message, meta = {}) => {
    logger.info({ ...meta }, message);
  },

  error: (message, meta = {}) => {
    logger.error({ ...meta }, message);
  },

  warn: (message, meta = {}) => {
    logger.warn({ ...meta }, message);
  },

  debug: (message, meta = {}) => {
    logger.debug({ ...meta }, message);
  },

  /**
   * Log authentication events (without sensitive data)
   */
  auth: {
    login: (username, success, ip) => {
      logger.info({ username, success, ip }, 'User login attempt');
    },
    logout: (username, ip) => {
      logger.info({ username, ip }, 'User logout');
    },
    failed: (username, reason, ip) => {
      logger.warn({ username, reason, ip }, 'Authentication failed');
    }
  },

  /**
   * Log authorization events
   */
  access: {
    denied: (userId, resource, action) => {
      logger.warn({ userId, resource, action }, 'Access denied');
    },
    granted: (userId, resource, action) => {
      logger.debug({ userId, resource, action }, 'Access granted');
    }
  },

  /**
   * Log database errors (without exposing sensitive data)
   */
  db: {
    error: (operation, entity, error) => {
      logger.error({ operation, entity, error: error.message }, 'Database error');
    },
    query: (operation, entity, duration) => {
      logger.debug({ operation, entity, duration }, 'Database query');
    }
  }
};

export default appLogger;
