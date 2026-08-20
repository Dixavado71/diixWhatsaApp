import { Router } from 'express';
import { clientController, extractAuthContext } from '../controllers/clientController.js';
import { requireTenant } from '../../../shared/middleware/auth.js';

const router = Router();

// All client routes require tenant authentication
router.use(requireTenant);

// Middleware para extrair contexto de autenticação e injetar no req.auth
// Isso desacopla o controller do acesso direto a req.session.user
router.use(extractAuthContext);

// Clients CRUD - usando métodos refatorados do BaseController
router.get('/clients', clientController.list);
router.get('/clients/new', clientController.showNew);
router.post('/clients', clientController.create);
router.get('/clients/:id/edit', clientController.showEdit);
router.post('/clients/:id', clientController.update);
router.post('/clients/:id/delete', clientController.delete);

// Rotas extras específicas (exemplos)
// router.post('/clients/:id/toggle-active', clientController.toggleActive);
// router.get('/clients/search', clientController.search);

export default router;
