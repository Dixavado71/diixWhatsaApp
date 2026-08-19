import { Router } from 'express';
import { userController } from '../controllers/userController.js';
import { requireAuth, requireMaster } from '../../../shared/middleware/auth.js';

const router = Router();

// All user routes require authentication and MASTER role
router.use(requireAuth);
router.use(requireMaster);

// User management routes
router.get('/users', userController.listUsers);
router.get('/users/new', userController.showNewUser);
router.post('/users', userController.createUser);
router.get('/users/:id/edit', userController.showEditUser);
router.post('/users/:id', userController.updateUser);
router.post('/users/:id/delete', userController.deleteUser);

export default router;

