import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 7171,
  
  databaseUrl: process.env.DATABASE_URL || '',
  
  sessionSecret: process.env.SESSION_SECRET || 'change-this-secret-in-production',
  
  masterUsername: process.env.MASTER_USERNAME || 'dixavado',
  masterPassword: process.env.MASTER_PASSWORD || 'ALTERAR_SENHA',
  masterEmail: process.env.MASTER_EMAIL || 'admin@diixsolutions.local'
};

// Validate required environment variables
const requiredEnvVars = ['DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`⚠️  Warning: Missing environment variables: ${missingEnvVars.join(', ')}`);
  console.warn('Please check your .env file');
}
