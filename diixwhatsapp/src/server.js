import app from './app.js';
import { config } from './config/env.js';
import { logger } from './config/database.js';

const PORT = config.port;

const server = app.listen(PORT, () => {
  logger.info(`🚀 DiixWhatsApp running on port ${PORT}`);
  logger.info(`📋 Environment: ${config.nodeEnv}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Process terminated');
    process.exit(0);
  });
});

export default server;
