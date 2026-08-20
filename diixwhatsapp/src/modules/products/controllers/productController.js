/**
 * Product Controller - Handle HTTP requests for Product entity (API ONLY)
 * Responsibilities:
 * - Receive request
 * - Get authenticated context
 * - Validate input
 * - Call service
 * - Delegate errors to global handler
 */
import { productService } from '../services/productService.js';
import { createProductSchema, updateProductSchema } from '../validators/productValidator.js';

export const productController = {
  /**
   * List all products for the tenant
   */
  listProducts: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      const products = await productService.getAllProducts(tenantId);

      res.json({
        success: true,
        data: { products }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Show new product metadata (API equivalent of show form)
   */
  showNewProduct: (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint pronto. Envie um POST com os dados do novo produto.'
    });
  },

  /**
   * Create a new product
   */
  createProduct: async (req, res, next) => {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;
      
      // Dados necessários para o Service (Auditoria)
      const adminUserId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      const product = await productService.createProduct(validatedData, tenantId, adminUserId, ip);

      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Show edit product data (API equivalent of show edit form)
   */
  showEditProduct: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      
      // O service já lança erro se não encontrar, delegando ao global handler
      const product = await productService.getProductById(req.params.id, tenantId);

      res.json({
        success: true,
        data: { product }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a product
   */
  updateProduct: async (req, res, next) => {
    try {
      const validatedData = updateProductSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;
      
      // Dados necessários para o Service (Auditoria)
      const adminUserId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      // O service já verifica a existência e lança erro se necessário
      const product = await productService.updateProduct(req.params.id, tenantId, validatedData, adminUserId, ip);

      res.json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: product
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a product
   */
  deleteProduct: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      
      // Dados necessários para o Service (Auditoria)
      const adminUserId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      await productService.deleteProduct(req.params.id, tenantId, adminUserId, ip);

      res.json({
        success: true,
        message: 'Produto excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
};