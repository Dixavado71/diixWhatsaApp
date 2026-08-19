import { Router } from 'express';
import { clientController } from '../controllers/clientController.js';
import { requireTenant } from '../../../shared/middleware/auth.js';

const router = Router();

// All client routes require tenant authentication
router.use(requireTenant);

// Clients CRUD
router.get('/clients', clientController.listClients);
router.get('/clients/new', clientController.showNewClient);
router.post('/clients', clientController.createClient);
router.get('/clients/:id/edit', clientController.showEditClient);
router.post('/clients/:id', clientController.updateClient);
router.post('/clients/:id/delete', clientController.deleteClient);

export default router;
