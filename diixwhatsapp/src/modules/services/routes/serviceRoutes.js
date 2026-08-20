import { Router } from 'express';
import { serviceController } from '../controllers/serviceController.js';
import { requireTenant } from '../../../shared/middleware/auth.js';
import { tenantContext } from '../../../shared/middleware/tenantContext.js';

const router = Router();

/**
 * Services Routes - All routes require tenant authentication and context
 * Using requireTenant ensures only authenticated tenant users can access
 */

// List all services for the tenant
router.get('/services', requireTenant, tenantContext, serviceController.listServices);

// Show form to create a new service
router.get('/services/new', requireTenant, tenantContext, serviceController.showNewService);

// Create a new service
router.post('/services', requireTenant, tenantContext, serviceController.createService);

// Show form to edit an existing service
router.get('/services/:id/edit', requireTenant, tenantContext, serviceController.showEditService);

// Update an existing service
router.post('/services/:id', requireTenant, tenantContext, serviceController.updateService);

// Delete a service
router.post('/services/:id/delete', requireTenant, tenantContext, serviceController.deleteService);

export default router;

