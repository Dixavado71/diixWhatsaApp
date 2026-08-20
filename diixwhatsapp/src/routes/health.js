import express from 'express';
import { prisma, logger } from '../infrastructure/database/prismaClient.js';
import { getRedisClient, checkRedisHealth } from '../infrastructure/cache/redisClient.js';

const router = express.Router();

/**
 * Health check - Advanced check for Database and Redis
 * Returns 200 if all services healthy, 503 if any fail
 */
router.get('/health', async (req, res) => {
  const healthStatus = {
    status: 'ok',
    service: 'DiixWhatsApp',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    checks: {}
  };
  
  let allHealthy = true;
  
  // Check Database using singleton Prisma client
  try {
    await prisma.$queryRaw`SELECT 1 as connected`;
    healthStatus.checks.database = { status: 'healthy' };
  } catch (error) {
    healthStatus.checks.database = { 
      status: 'unhealthy', 
      error: error.message 
    };
    allHealthy = false;
    logger.error('Health check DB failed', { error: error.message });
  }
  
  // Check Redis connection via session store client
  try {
    const redisHealthy = await checkRedisHealth();
    healthStatus.checks.redis = { 
      status: redisHealthy ? 'healthy' : 'unhealthy'
    };
    if (!redisHealthy) {
      allHealthy = false;
    }
  } catch (error) {
    healthStatus.checks.redis = { 
      status: 'unhealthy', 
      error: error.message 
    };
    allHealthy = false;
    logger.error('Health check Redis failed', { error: error.message });
  }
  
  // Return appropriate status code
  const statusCode = allHealthy ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

/**
 * Database-only Health Check
 * Uses the singleton Prisma client for stable verification
 */
router.get('/health/db', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 as connected`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    logger.error('Health check DB failed', { error: error.message });
    res.status(500).json({ 
      status: 'error', 
      database: 'disconnected', 
      error: error.message 
    });
  }
});

export default router;
