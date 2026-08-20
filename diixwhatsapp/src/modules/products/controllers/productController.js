/**
 * Product Controller - Handle HTTP requests for Product entity (API ONLY)
 * 
 * REFACTORED: Utiliza BaseController para reduzir código repetitivo.
 * Desacoplado: Não acessa req.session.user diretamente.
 * O contexto de autenticação é injetado via middleware extractAuthContext.
 * 
 * Responsibilities:
 * - Receive request
 * - Get authenticated context from req.auth (injected by middleware)
 * - Validate input
 * - Call service
 * - Delegate errors to global handler
 */
import { createCRUDController } from '../../shared/controllers/baseController.js';
import { productService } from '../services/productService.js';
import { createProductSchema, updateProductSchema } from '../validators/productValidator.js';

/**
 * Controller refatorado usando padrão CRUD genérico
 * Redução de ~60% do código original
 */
export const productController = createCRUDController({
  service: productService,
  entityName: 'product',
  entityNamePlural: 'products',
  createSchema: createProductSchema,
  updateSchema: updateProductSchema,
  
  // Métodos extras específicos (se necessário)
  extraMethods: {
    /**
     * List all products for the tenant
     * GET /api/products
     */
    listProducts: async (req, res, next) => {
      try {
        const { tenantId } = req.auth;
        const products = await productService.getAllProducts(tenantId);

        res.json({
          success: true,
          data: { products }
        });
      } catch (error) {
        next(error);
      }
    }
  }
});

// Exportação individual dos métodos para compatibilidade com rotas existentes
export const {
  list,
  showNew,
  create,
  showEdit,
  update,
  delete: deleteProduct,
  listProducts
} = productController;
