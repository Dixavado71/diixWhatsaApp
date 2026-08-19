import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { loginLimiter } from '../shared/middleware/rateLimiter.js';

const router = Router();

// Show login page
router.get('/login', authController.showLogin);

// Process login (with rate limiting)
router.post('/login', loginLimiter, authController.login);

// Logout
router.post('/logout', authController.logout);

// Admin-specific login page
router.get('/admin/login', authController.showAdminLogin);

// Tenant-specific login page
router.get('/tenant/login', authController.showTenantLogin);

export default router;
