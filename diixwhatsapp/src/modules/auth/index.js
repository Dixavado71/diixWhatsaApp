/**
 * Auth Module - Public API
 */
import { authController } from './controllers/authController.js';
import { authService } from './services/authService.js';
import { authRoutes } from './routes/authRoutes.js';

export {
  authController,
  authService,
  authRoutes
};
