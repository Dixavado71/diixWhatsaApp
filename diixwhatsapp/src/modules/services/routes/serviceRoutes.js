import { Router } from 'express';
import { serviceController } from '../controllers/serviceController.js';
import { requireAuth } from '../../../shared/middleware/auth.js';
import { tenantContext } from '../../../shared/middleware/tenantContext.js';

const router = Router();

/**
 * Services Routes - All routes require authentication and tenant context
 */

// List all services for the tenant
router.get('/services', requireAuth, tenantContext, serviceController.listServices);

// Show form to create a new service
router.get('/services/new', requireAuth, tenantContext, serviceController.showNewService);

// Create a new service
router.post('/services', requireAuth, tenantContext, serviceController.createService);

// Show form to edit an existing service
router.get('/services/:id/edit', requireAuth, tenantContext, serviceController.showEditService);

// Update an existing service
router.post('/services/:id', requireAuth, tenantContext, serviceController.updateService);

// Delete a service
router.post('/services/:id/delete', requireAuth, tenantContext, serviceController.deleteService);

export default router;

