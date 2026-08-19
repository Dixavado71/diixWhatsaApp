import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Please check your .env file');
}

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 7171,
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Session
  sessionSecret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  
  // Master credentials (for initial setup)
  masterUsername: process.env.MASTER_USERNAME || 'dixavado',
  masterPassword: process.env.MASTER_PASSWORD || 'ALTERAR_SENHA',
  masterEmail: process.env.MASTER_EMAIL || 'admin@diixsolutions.local',
  
  // URLs
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  apiUrl: process.env.API_URL || 'http://localhost:7171',
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info'
};
