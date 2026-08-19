import { Router } from 'express';
import { adminController } from '../controllers/adminController.js';
import { requireMaster } from '../middleware/auth.js';

const router = Router();

// All admin routes require Master role
router.use(requireMaster);

// Dashboard
router.get('/dashboard', adminController.dashboard);

// Tenants CRUD
router.get('/tenants', adminController.listTenants);
router.get('/tenants/new', adminController.showNewTenant);
router.post('/tenants', adminController.createTenant);
router.get('/tenants/:id/edit', adminController.showEditTenant);
router.post('/tenants/:id', adminController.updateTenant);
router.post('/tenants/:id/toggle', adminController.toggleTenant);
router.post('/tenants/:id/delete', adminController.deleteTenant);

// Users CRUD
router.get('/users', adminController.listUsers);
router.get('/users/new', adminController.showNewUser);
router.post('/users', adminController.createUser);
router.get('/users/:id/edit', adminController.showEditUser);
router.post('/users/:id', adminController.updateUser);
router.post('/users/:id/delete', adminController.deleteUser);

export default router;
