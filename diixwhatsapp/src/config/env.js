import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Please check your .env file');
}

// SECURITY: Enforce strong session secret in production
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
    console.error('❌ FATAL ERROR: SESSION_SECRET must be set to a strong random value (min 32 chars) in production.');
    console.error('Generate one with: openssl rand -base64 32');
    process.exit(1);
  }
  
  // Validate MASTER_PASSWORD is changed from default
  if (!masterPassword || 
      masterPassword === 'ALTERAR_SENHA' ||
      masterPassword === '<change-default-password>') {
    console.error('❌ FATAL ERROR: MASTER_PASSWORD must be changed from default value in production.');
    console.error('Use a strong password with at least 12 characters.');
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
  
  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:7171',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};
