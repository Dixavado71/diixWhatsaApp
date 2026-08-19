/**
 * Products Module - Public API
 * Exposes only necessary components for external use
 */
import { productController } from './controllers/productController.js';
import { productService } from './services/productService.js';
import { productRepository } from './repositories/productRepository.js';
import productRoutes from './routes/productRoutes.js';

export {
  productController,
  productService,
  productRepository,
  productRoutes
};

// Default export for module registration
export default {
  name: 'products',
  routes: productRoutes,
  controller: productController,
  service: productService,
  repository: productRepository
};

