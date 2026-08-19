/**
 * Clients Module - Public API
 * Exposes only necessary components for external use
 */
import { clientController } from './controllers/clientController.js';
import { clientService } from './services/clientService.js';
import { clientRepository } from './repositories/clientRepository.js';
import clientRoutes from './routes/clientRoutes.js';

export {
  clientController,
  clientService,
  clientRepository,
  clientRoutes
};

// Default export for module registration
export default {
  name: 'clients',
  routes: clientRoutes,
  controller: clientController,
  service: clientService,
  repository: clientRepository
};
