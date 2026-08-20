import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { requireAuth, requireMaster } from '../../../shared/middleware/auth.js';
import { extractAuthContext } from '../../../shared/middleware/extractAuthContext.js';

const router = Router();

/**
 * User Management Routes
 * - MASTER: Can manage all users across all tenants
 * - TENANT_ADMIN: Can manage only users within their own tenant (enforced by extractAuthContext + service layer)
 * 
 * Changes applied:
 * - Replaced generic middleware with requireAuth for base authentication
 * - Added extractAuthContext to inject req.auth with tenantId, userId, role, ip
 * - Service layer now enforces tenant isolation based on user role
 */

// Apply authentication to all routes
router.use(requireAuth);

// Extract auth context for all routes - provides tenantId, userId, role, ip in req.auth
router.use(extractAuthContext);

// User management routes (scoped by tenant for TENANT_ADMIN, global for MASTER)
router.get('/users', userController.listUsers);
router.get('/users/new', userController.showNewUser);
router.post('/users', userController.createUser);
router.get('/users/:id/edit', userController.showEditUser);
router.post('/users/:id', userController.updateUser);
router.post('/users/:id/delete', userController.deleteUser);

export default router;

