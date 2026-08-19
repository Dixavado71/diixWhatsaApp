import { productRepository } from '../repositories/productRepository.js';

/**
 * Product Service - Business logic layer for Product entity
 */
export const productService = {
  /**
   * Get all products for a tenant
   */
  async getAllProducts(tenantId, filters = {}) {
    return productRepository.findAllByTenant(tenantId, filters);
  },

  /**
   * Get a product by ID for a specific tenant
   */
  async getProductById(id, tenantId) {
    return productRepository.findByIdAndTenant(id, tenantId);
  },

  /**
   * Create a new product
   */
  async createProduct(data, tenantId) {
    // Ensure tenantId is set correctly from authenticated context
    const productData = {
      ...data,
      tenantId
    };

    return productRepository.create(productData);
  },

  /**
   * Update a product
   */
  async updateProduct(id, tenantId, data) {
    const product = await productRepository.findByIdAndTenant(id, tenantId);
    
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return productRepository.update(id, tenantId, data);
  },

  /**
   * Delete a product
   */
  async deleteProduct(id, tenantId) {
    const product = await productRepository.findByIdAndTenant(id, tenantId);
    
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return productRepository.delete(id, tenantId);
  },

  /**
   * Toggle product active status
   */
  async toggleProductActive(id, tenantId) {
    const product = await productRepository.findByIdAndTenant(id, tenantId);
    
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    return productRepository.toggleActive(id, tenantId);
  },

  /**
   * Count products for a tenant
   */
  async countProducts(tenantId, filters = {}) {
    return productRepository.countByTenant(tenantId, filters);
  },

  /**
   * Search products within a tenant
   */
  async searchProducts(tenantId, searchTerm) {
    return productRepository.searchByTenant(tenantId, searchTerm);
  }
};

