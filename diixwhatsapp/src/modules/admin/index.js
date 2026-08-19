/**
 * Admin Module - Public API
 * Exposes only necessary components for external use
 */
import { adminController } from './controllers/adminController.js';
import { adminService } from './services/adminService.js';
import { adminRepository } from './repositories/adminRepository.js';
import adminRoutes from './routes/adminRoutes.js';

export {
  adminController,
  adminService,
  adminRepository,
  adminRoutes
};

// Default export for module registration
export default {
  name: 'admin',
  routes: adminRoutes,
  controller: adminController,
  service: adminService,
  repository: adminRepository
};
