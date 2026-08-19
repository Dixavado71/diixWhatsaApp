import { Router } from 'express';
import { tenantController } from '../controllers/tenantController.js';
import { requireMaster } from '../../../shared/middleware/auth.js';

const router = Router();

// All tenant admin routes require MASTER role
router.use(requireMaster);

// Tenants CRUD
router.get('/tenants', tenantController.listTenants);
router.get('/tenants/new', tenantController.showNewTenant);
router.post('/tenants', tenantController.createTenant);
router.get('/tenants/:id/edit', tenantController.showEditTenant);
router.post('/tenants/:id', tenantController.updateTenant);
router.post('/tenants/:id/toggle', tenantController.toggleTenant);
router.post('/tenants/:id/delete', tenantController.deleteTenant);

export default router;
