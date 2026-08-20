import { Redis } from 'ioredis';
import pino from 'pino';
import { config } from '../../config/env.js';

const logger = pino({
  level: config.logLevel,
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard'
    }
  }
});

/**
 * Redis Client Singleton
 *
 * Creates a single Redis connection that is reused across the application.
 * In production, this ensures efficient connection pooling and prevents
 * connection exhaustion.
 *
 * @type {Redis|null}
 */
let redisClient = null;

/**
 * Get or create Redis client instance
 *
 * @returns {Redis} Redis client instance
 */
export function getRedisClient() {
  if (!redisClient) {
    // Parse Redis URL from environment
    const redisUrl = config.redisUrl || 'redis://localhost:6379';

    // Extract options from URL for better logging
    let redisHost = 'localhost';
    let redisPort = 6379;
    try {
      const url = new URL(redisUrl);
      redisHost = url.hostname;
      redisPort = parseInt(url.port, 10) || 6379;
    } catch (e) {
      // If URL parsing fails, use default values
    }

    // Create Redis client with optimized settings for production
    redisClient = new Redis(redisUrl, {
      // Connection settings
      maxRetriesPerRequest: 3,
      retryDelayOnFailover: 100,

      // Keep-alive to prevent connection timeouts
      keepAlive: 30000,

      // Connection name for debugging in Redis MONITOR
      connectionName: 'diixwhatsapp-session-store',

      // Lazy connect - only connect when first command is issued
      lazyConnect: true,

      // Enable ready check to ensure Redis is fully loaded
      enableReadyCheck: true,

      // Family: 4 = IPv4, 6 = IPv6, 0 = either
      family: 4
    });

    // Event listeners for monitoring connection state
    redisClient.on('error', (err) => {
      logger.error(`[Redis] Connection error: ${err.message}`);
    });

    redisClient.on('connect', () => {
      logger.info(`[Redis] Connected to ${redisHost}:${redisPort}`);
    });

    redisClient.on('ready', () => {
      logger.info('[Redis] Client ready');
    });

    redisClient.on('close', () => {
      logger.warn('[Redis] Connection closed');
    });

    redisClient.on('reconnecting', (delay) => {
      logger.info(`[Redis] Reconnecting in ${delay}ms`);
    });
  }

  return redisClient;
}

/**
 * Close Redis connection gracefully
 *
 * @returns {Promise<void>}
 */
export async function closeRedisClient() {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    logger.info('[Redis] Connection closed gracefully');
  }
}

/**
 * Check Redis connection health
 *
 * @returns {Promise<boolean>} True if Redis is reachable
 */
export async function checkRedisHealth() {
  try {
    const client = getRedisClient();
    const result = await client.ping();
    return result === 'PONG';
  } catch (error) {
    logger.error(`[Redis] Health check failed: ${error.message}`);
    return false;
  }
}
