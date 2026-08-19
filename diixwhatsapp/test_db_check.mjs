import './tests/setup.js';
import { prisma } from './src/infrastructure/database/prismaClient.js';

async function checkDatabase() {
  try {
    await prisma.$connect();
    console.log('Prisma connection: SUCCESS');
    
    // Check database name without exposing credentials
    const result = await prisma.$queryRaw`SELECT current_database() as db_name`;
    console.log('Database name:', result[0]?.db_name || 'unknown');
    
    await prisma.$disconnect();
    console.log('Prisma disconnected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
}

checkDatabase();
