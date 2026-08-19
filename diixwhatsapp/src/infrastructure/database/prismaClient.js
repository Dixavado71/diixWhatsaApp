import { PrismaClient } from '@prisma/client';
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
 * Singleton Prisma Client
 * Centralized database connection management
 */
const prisma = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' },
    { emit: 'event', level: 'error' }
  ]
});

// Log Prisma events
prisma.$on('query', (e) => {
  logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Prisma Query');
});

prisma.$on('info', (e) => {
  logger.info(e);
});

prisma.$on('warn', (e) => {
  logger.warn(e);
});

prisma.$on('error', (e) => {
  logger.error(e);
});

// Graceful shutdown - only disconnect once
let isDisconnecting = false;

async function disconnectPrisma() {
  if (!isDisconnecting) {
    isDisconnecting = true;
    logger.info('Shutting down Prisma connection...');
    await prisma.$disconnect();
  }
}

process.on('beforeExit', disconnectPrisma);
process.on('SIGTERM', disconnectPrisma);
process.on('SIGINT', disconnectPrisma);

export { prisma, logger };
