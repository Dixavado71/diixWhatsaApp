import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { requireAuth } from '../../../shared/middleware/auth.js';
import { tenantContext } from '../../../shared/middleware/tenantContext.js';
import { tenantIsolation } from '../../../shared/middleware/tenantIsolation.js';

const router = Router();

/**
 * User Management Routes
 * - MASTER: Can manage all users across all tenants (bypasses tenant isolation)
 * - TENANT_ADMIN: Can manage only users within their own tenant (enforced by tenantIsolation)
 */

// Apply authentication to all routes
router.use(requireAuth);

// Tenant context middleware - attaches tenantId from user session to request
router.use(tenantContext);

// Tenant isolation middleware - ensures users can only access resources from their tenant
// MASTER role bypasses this check in the middleware
router.use(tenantIsolation);

// User management routes (scoped by tenant for TENANT_ADMIN, global for MASTER)
router.get('/users', userController.listUsers);
router.get('/users/new', userController.showNewUser);
router.post('/users', userController.createUser);
router.get('/users/:id/edit', userController.showEditUser);
router.post('/users/:id', userController.updateUser);
router.post('/users/:id/delete', userController.deleteUser);

export default router;

