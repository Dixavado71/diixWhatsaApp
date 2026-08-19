/**
 * Tenants Module - Public API
 * Exposes only necessary components for external use
 */
import { tenantController } from './controllers/tenantController.js';
import { tenantService } from './services/tenantService.js';
import { tenantRepository } from './repositories/tenantRepository.js';
import tenantRoutes from './routes/tenantRoutes.js';

export {
  tenantController,
  tenantService,
  tenantRepository,
  tenantRoutes
};

// Default export for module registration
export default {
  name: 'tenants',
  routes: tenantRoutes,
  controller: tenantController,
  service: tenantService,
  repository: tenantRepository
};
