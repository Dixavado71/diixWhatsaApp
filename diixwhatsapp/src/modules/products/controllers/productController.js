/**
 * Product Controller - Handle HTTP requests for Product entity
 * Responsibilities:
 * - Receive request
 * - Get authenticated context
 * - Validate input
 * - Call service
 * - Return response
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

      res.render('tenant/products/index', {
        title: 'Produtos',
        products
      });
    } catch (error) {
      console.error('List products error:', error);
      res.render('tenant/products/index', {
        title: 'Produtos',
        products: [],
        error: 'Erro ao carregar produtos'
      });
    }
  },

  /**
   * Show new product form
   */
  showNewProduct: (req, res) => {
    res.render('tenant/products/new', {
      title: 'Novo Produto',
      product: null,
      error: null
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

      res.redirect('/tenant/products');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.render('tenant/products/new', {
          title: 'Novo Produto',
          product: req.body,
          error: errorMessage
        });
      }

      console.error('Create product error:', error);
      res.render('tenant/products/new', {
        title: 'Novo Produto',
        product: req.body,
        error: error.message || 'Erro ao criar produto'
      });
    }
  },

  /**
   * Show edit product form
   */
  showEditProduct: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const product = await productService.getProductById(req.params.id, tenantId);

      if (!product) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Produto não encontrado'
        });
      }

      res.render('tenant/products/edit', {
        title: 'Editar Produto',
        product
      });
    } catch (error) {
      console.error('Show edit product error:', error);
      res.redirect('/tenant/products');
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
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Produto não encontrado'
        });
      }

      // Log update would go here

      res.redirect('/tenant/products');
    } catch (error) {
      console.error('Update product error:', error);
      const product = await productService.getProductById(req.params.id, req.session.user.tenantId);
      res.render('tenant/products/edit', {
        title: 'Editar Produto',
        product,
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

      res.redirect('/tenant/products');
    } catch (error) {
      console.error('Delete product error:', error);
      res.redirect('/tenant/products');
    }
  }
};

