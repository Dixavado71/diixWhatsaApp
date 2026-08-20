import session from 'express-session';
import RedisStore from 'connect-redis';
import { config } from './env.js';
import { getRedisClient } from '../infrastructure/cache/redisClient.js';

/**
 * Session Store Configuration with Redis
 * 
 * Creates a Redis-backed session store for production scalability.
 * In development, falls back to memory store if Redis is unavailable.
 * 
 * @returns {Object} Configured session middleware
 */
export function createSessionStore() {
  let store;
  
  try {
    // Initialize Redis store
    const redisClient = getRedisClient();
    store = new RedisStore({ client: redisClient });
    
    // Logger available after env is loaded
    const pino = await import('pino');
    const logger = pino.default({
      level: config.logLevel,
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard'
        }
      }
    });
    logger.info('[Session] Using Redis store for sessions');
  } catch (error) {
    // Fallback for development only - should never be used in production
    if (config.nodeEnv === 'production') {
      throw new Error('Redis session store required in production but failed to initialize');
    }
    
    // Memory store fallback for development
    store = new session.MemoryStore();
  }
  
  return store;
}

/**
 * Session configuration with secure cookie settings
 */
export async function getSessionConfig() {
  const store = await createSessionStore();
  
  return {
    store,
    secret: config.sessionSecret,
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    cookie: {
      httpOnly: true, // Prevent XSS attacks
      secure: config.nodeEnv === 'production', // HTTPS only in production
      sameSite: 'lax', // CSRF protection
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    },
    name: 'diixwhatsapp.sid' // Custom cookie name
  };
}

// Default export for backward compatibility
export default async function sessionConfig(req, res, next) {
  const sessionMiddleware = session(await getSessionConfig());
  sessionMiddleware(req, res, next);
}
