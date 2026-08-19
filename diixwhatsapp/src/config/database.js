/**
 * Database Configuration
 * Re-exports database-related utilities from infrastructure
 */
import { prisma, logger } from '../infrastructure/database/prismaClient.js';

export { prisma, logger };

export default {
  prisma,
  logger
};
