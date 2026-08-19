import { Router } from 'express';
import { tenantController } from '../controllers/tenantController.js';
import { requireTenant } from '../shared/middleware/auth.js';

const router = Router();

// All tenant routes require tenant authentication
router.use(requireTenant);

// Dashboard
router.get('/dashboard', tenantController.dashboard);

// Products CRUD (legacy - to be modularized)
router.get('/products', tenantController.listProducts);
router.get('/products/new', tenantController.showNewProduct);
router.post('/products', tenantController.createProduct);
router.get('/products/:id/edit', tenantController.showEditProduct);
router.post('/products/:id', tenantController.updateProduct);
router.post('/products/:id/delete', tenantController.deleteProduct);

// Users CRUD (tenant users - legacy, to be modularized)
router.get('/users', tenantController.listUsers);
router.get('/users/new', tenantController.showNewUser);
router.post('/users', tenantController.createUser);
router.get('/users/:id/edit', tenantController.showEditUser);
router.post('/users/:id', tenantController.updateUser);
router.post('/users/:id/delete', tenantController.deleteUser);

export default router;
