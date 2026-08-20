import dotenv from 'dotenv';
import { z } from 'zod';
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

// Zod schema for environment variable validation
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(7171),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters long').optional(),
  MASTER_PASSWORD: z.string().min(1, 'MASTER_PASSWORD is required').optional(),
  MASTER_USERNAME: z.string().default('dixavado'),
  MASTER_EMAIL: z.string().email('MASTER_EMAIL must be a valid email').default('admin@diixsolutions.local'),
  REDIS_URL: z.string().url('REDIS_URL must be a valid URL').default('redis://localhost:6379'),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),
  FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  API_URL: z.string().url().default('http://localhost:7171')
});

/**
 * Validate environment variables with strict checks for production
 * Application will exit immediately in production if critical values are missing or default
 */
function validateEnvironment() {
  try {
    const parsedEnv = envSchema.parse(process.env);
    
    // Critical security validation for production
    if (parsedEnv.NODE_ENV === 'production') {
      // Validate SESSION_SECRET
      if (!parsedEnv.SESSION_SECRET) {
        logger.error('FATAL ERROR: SESSION_SECRET is required in production.');
        logger.error('Generate one with: openssl rand -base64 32');
        process.exit(1);
      }
      
      if (parsedEnv.SESSION_SECRET.length < 32) {
        logger.error('FATAL ERROR: SESSION_SECRET must be at least 32 characters in production.');
        process.exit(1);
      }
      
      // Validate MASTER_PASSWORD is not default or empty
      if (!parsedEnv.MASTER_PASSWORD || 
          parsedEnv.MASTER_PASSWORD === '<change-default-password>' ||
          parsedEnv.MASTER_PASSWORD === 'ALTERAR_SENHA') {
        logger.error('FATAL ERROR: MASTER_PASSWORD must be changed from default value in production.');
        logger.error('Use a strong password with at least 12 characters including special chars.');
        process.exit(1);
      }
    }
    
    return parsedEnv;
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.error('Environment validation failed:', error.errors);
    } else {
      logger.error('Unexpected error during environment validation:', error);
    }
    process.exit(1);
  }
}

const validatedEnv = validateEnvironment();

export const config = {
  nodeEnv: validatedEnv.NODE_ENV,
  port: validatedEnv.PORT,
  
  // Database
  databaseUrl: validatedEnv.DATABASE_URL,
  
  // Session - NO FALLBACK IN PRODUCTION (validated above)
  sessionSecret: validatedEnv.SESSION_SECRET || (validatedEnv.NODE_ENV === 'production' ? undefined : 'dev-secret-change-in-production'),
  
  // Master credentials (for initial setup) - NO FALLBACK IN PRODUCTION
  masterUsername: validatedEnv.NODE_ENV === 'production' ? validatedEnv.MASTER_USERNAME : validatedEnv.MASTER_USERNAME,
  masterPassword: validatedEnv.MASTER_PASSWORD || (validatedEnv.NODE_ENV === 'production' ? undefined : 'dev-password-change-me'),
  masterEmail: validatedEnv.MASTER_EMAIL,
  
  // Redis
  redisUrl: validatedEnv.REDIS_URL,
  
  // URLs
  frontendUrl: validatedEnv.FRONTEND_URL,
  apiUrl: validatedEnv.API_URL,
  
  // Logging
  logLevel: validatedEnv.LOG_LEVEL
};
