import dotenv from 'dotenv';
import pino from 'pino';

dotenv.config();

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

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  logger.warn(`Missing environment variables: ${missingEnvVars.join(', ')}`);
  logger.warn('Please check your .env file');
}

// SECURITY: Enforce strong session secret and master password in production
// Prevents application from starting with weak/default values
const isProduction = process.env.NODE_ENV === 'production';

if (isProduction) {
  const sessionSecret = process.env.SESSION_SECRET;
  const masterPassword = process.env.MASTER_PASSWORD;
  
  // Validate SESSION_SECRET is set and not a default/weak value
  if (!sessionSecret || 
      sessionSecret === 'change-this-secret-in-production' ||
      sessionSecret === 'change-this-secret-in-production-min-32-chars' ||
      sessionSecret === '<generate-random-secret-min-32-chars>' ||
      sessionSecret.length < 32) {
    logger.error('FATAL ERROR: SESSION_SECRET must be set to a strong random value (min 32 chars) in production.');
    logger.error('Generate one with: openssl rand -base64 32');
    process.exit(1);
  }
  
  // Validate MASTER_PASSWORD is changed from default
  if (!masterPassword || 
      masterPassword === 'ALTERAR_SENHA' ||
      masterPassword === '<change-default-password>') {
    logger.error('FATAL ERROR: MASTER_PASSWORD must be changed from default value in production.');
    logger.error('Use a strong password with at least 12 characters.');
    process.exit(1);
  }
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 7171,
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Session - NO FALLBACK IN PRODUCTION (validated above)
  sessionSecret: process.env.SESSION_SECRET || (isProduction ? undefined : 'dev-secret-change-in-production'),
  
  // Master credentials (for initial setup) - NO FALLBACK IN PRODUCTION
  masterUsername: process.env.MASTER_USERNAME || (isProduction ? undefined : 'dixavado'),
  masterPassword: process.env.MASTER_PASSWORD || (isProduction ? undefined : 'dev-password-change-me'),
  masterEmail: process.env.MASTER_EMAIL || (isProduction ? undefined : 'admin@diixsolutions.local'),
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:7171',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};
