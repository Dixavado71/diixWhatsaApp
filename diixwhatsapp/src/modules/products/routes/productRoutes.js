import { Router } from 'express';
import { productController } from '../controllers/productController.js';
import { requireTenant } from '../../../shared/middleware/auth.js';

const router = Router();

// All product routes require tenant authentication
router.use(requireTenant);

// Products CRUD
router.get('/products', productController.listProducts);
router.get('/products/new', productController.showNewProduct);
router.post('/products', productController.createProduct);
router.get('/products/:id/edit', productController.showEditProduct);
router.post('/products/:id', productController.updateProduct);
router.post('/products/:id/delete', productController.deleteProduct);

export default router;

