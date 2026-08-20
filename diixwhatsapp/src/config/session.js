import session from 'express-session';
import RedisStore from 'connect-redis';
import { config } from './env.js';
import { getRedisClient } from '../infrastructure/cache/redisClient.js';

/**
 * Session Configuration with Redis Store
 * 
 * In development: Falls back to memory store if Redis is unavailable
 * In production: Requires Redis for horizontal scalability
 */
let store;

try {
  // Initialize Redis store
  const redisClient = getRedisClient();
  store = new RedisStore({ client: redisClient });
  console.log('[Session] Using Redis store for sessions');
} catch (error) {
  console.warn('[Session] Redis not available, falling back to memory store (NOT suitable for production)');
  // Fallback for development only - should never be used in production
  const sessionModule = await import('express-session');
  store = new sessionModule.MemoryStore();
}

export const sessionConfig = session({
  store, // Redis store for production scalability
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
});
