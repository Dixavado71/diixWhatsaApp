import { Router } from 'express';
import { serviceController } from '../controllers/serviceController.js';
import { requireTenant } from '../../../shared/middleware/auth.js';
import { extractAuthContext } from '../../../shared/middleware/extractAuthContext.js';

const router = Router();

/**
 * Services Routes - All routes require tenant authentication and context
 * 
 * Changes applied:
 * - Replaced inline middleware with router.use() for cleaner code
 * - Using requireTenant to ensure only authenticated tenant users can access
 * - Added extractAuthContext to inject req.auth instead of accessing req.session directly
 */

// Apply middleware to all service routes
router.use(requireTenant);
router.use(extractAuthContext);

// List all services for the tenant
router.get('/services', serviceController.listServices);

// Show form to create a new service
router.get('/services/new', serviceController.showNewService);

// Create a new service
router.post('/services', serviceController.createService);

// Show form to edit an existing service
router.get('/services/:id/edit', serviceController.showEditService);

// Update an existing service
router.post('/services/:id', serviceController.updateService);

// Delete a service
router.post('/services/:id/delete', serviceController.deleteService);

export default router;

