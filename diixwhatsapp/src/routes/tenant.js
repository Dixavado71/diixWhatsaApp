import { Router } from 'express';
import { tenantController } from '../controllers/tenantController.js';
import { requireTenant } from '../middleware/auth.js';

const router = Router();

// All tenant routes require tenant authentication
router.use(requireTenant);

// Dashboard
router.get('/dashboard', tenantController.dashboard);

// Products CRUD
router.get('/products', tenantController.listProducts);
router.get('/products/new', tenantController.showNewProduct);
router.post('/products', tenantController.createProduct);
router.get('/products/:id/edit', tenantController.showEditProduct);
router.post('/products/:id', tenantController.updateProduct);
router.post('/products/:id/delete', tenantController.deleteProduct);

// Clients CRUD
router.get('/clients', tenantController.listClients);
router.get('/clients/new', tenantController.showNewClient);
router.post('/clients', tenantController.createClient);
router.get('/clients/:id/edit', tenantController.showEditClient);
router.post('/clients/:id', tenantController.updateClient);
router.post('/clients/:id/delete', tenantController.deleteClient);

// Services CRUD
router.get('/services', tenantController.listServices);
router.get('/services/new', tenantController.showNewService);
router.post('/services', tenantController.createService);
router.get('/services/:id/edit', tenantController.showEditService);
router.post('/services/:id', tenantController.updateService);
router.post('/services/:id/delete', tenantController.deleteService);

// Promotions CRUD
router.get('/promotions', tenantController.listPromotions);
router.get('/promotions/new', tenantController.showNewPromotion);
router.post('/promotions', tenantController.createPromotion);
router.get('/promotions/:id/edit', tenantController.showEditPromotion);
router.post('/promotions/:id', tenantController.updatePromotion);
router.post('/promotions/:id/delete', tenantController.deletePromotion);

// Users CRUD (tenant users)
router.get('/users', tenantController.listUsers);
router.get('/users/new', tenantController.showNewUser);
router.post('/users', tenantController.createUser);
router.get('/users/:id/edit', tenantController.showEditUser);
router.post('/users/:id', tenantController.updateUser);
router.post('/users/:id/delete', tenantController.deleteUser);

export default router;
