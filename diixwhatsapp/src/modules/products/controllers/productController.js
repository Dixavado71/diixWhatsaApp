/**
 * Product Controller - Handle HTTP requests for Product entity (API ONLY)
 * Responsibilities:
 * - Receive request
 * - Get authenticated context
 * - Validate input
 * - Call service
 * - Return JSON response
 */
import { productService } from '../services/productService.js';
import { createProductSchema, updateProductSchema } from '../validators/productValidator.js';

export const productController = {
  /**
   * List all products for the tenant
   */
  listProducts: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const products = await productService.getAllProducts(tenantId);

      res.json({
        success: true,
        data: { products }
      });
    } catch (error) {
      console.error('List products error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar produtos'
      });
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
  createProduct: async (req, res) => {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      const product = await productService.createProduct(validatedData, tenantId);

      // Log creation would go here (auditLog service to be integrated)

      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: product
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }

      console.error('Create product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar produto'
      });
    }
  },

  /**
   * Show edit product data (API equivalent of show edit form)
   */
  showEditProduct: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const product = await productService.getProductById(req.params.id, tenantId);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      res.json({
        success: true,
        data: { product }
      });
    } catch (error) {
      console.error('Show edit product error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar dados do produto'
      });
    }
  },

  /**
   * Update a product
   */
  updateProduct: async (req, res) => {
    try {
      const validatedData = updateProductSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      const product = await productService.updateProduct(req.params.id, tenantId, validatedData);

      if (!product) {
        return res.status(404).json({
          success: false,
          error: 'Produto não encontrado'
        });
      }

      // Log update would go here

      res.json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: product
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }

      console.error('Update product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao atualizar produto'
      });
    }
  },

  /**
   * Delete a product
   */
  deleteProduct: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;

      await productService.deleteProduct(req.params.id, tenantId);

      // Log deletion would go here

      res.json({
        success: true,
        message: 'Produto excluído com sucesso'
      });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao excluir produto'
      });
    }
  }
};