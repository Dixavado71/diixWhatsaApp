import { PrismaClient } from '@prisma/client';
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
 * Singleton Prisma Client
 * 
 * Garante uma única instância do Prisma Client em toda a aplicação.
 * Em produção, os logs de query são desativados para evitar:
 * - Vazamento de dados sensíveis via logs
 * - Overhead de performance
 * 
 * O singleton é implementado usando uma variável global que persiste
 * entre hot-reloads em desenvolvimento (Node.js com ESM).
 */

// Variável global para armazenar a instância singleton
let prismaInstance = null;

// Função para criar nova instância do Prisma Client
function createPrismaClient() {
  const isProduction = config.nodeEnv === 'production';
  
  // Em produção, desativa logs detalhados para segurança e performance
  const prismaConfig = {
    log: isProduction 
      ? ['error'] // Apenas erros em produção
      : [
          { emit: 'event', level: 'query' },
          { emit: 'event', level: 'info' },
          { emit: 'event', level: 'warn' },
          { emit: 'event', level: 'error' }
        ]
  };

  return new PrismaClient(prismaConfig);
}

// Implementação do Singleton
export function getPrismaClient() {
  if (!prismaInstance) {
    prismaInstance = createPrismaClient();
    
    // Configurar listeners de eventos apenas se não estiver em produção
    const isProduction = config.nodeEnv === 'production';
    
    if (!isProduction) {
      // Log Prisma events em desenvolvimento
      prismaInstance.$on('query', (e) => {
        logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Prisma Query');
      });

      prismaInstance.$on('info', (e) => {
        logger.info(e);
      });

      prismaInstance.$on('warn', (e) => {
        logger.warn(e);
      });
    }

    // Erros sempre são logados
    prismaInstance.$on('error', (e) => {
      logger.error(e);
    });
  }
  
  return prismaInstance;
}

// Graceful shutdown - desconecta o cliente Prisma
let isDisconnecting = false;

async function disconnectPrisma() {
  if (!isDisconnecting && prismaInstance) {
    isDisconnecting = true;
    logger.info('Shutting down Prisma connection...');
    await prismaInstance.$disconnect();
    prismaInstance = null; // Reset para permitir reconexão se necessário
  }
}

process.on('beforeExit', disconnectPrisma);
process.on('SIGTERM', disconnectPrisma);
process.on('SIGINT', disconnectPrisma);

// Exporta a instância singleton
const prisma = getPrismaClient();

export { prisma, logger, disconnectPrisma };
