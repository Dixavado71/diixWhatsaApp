/**
 * Product Service - Business logic layer for Product entity
 * Responsibilities:
 * - Handle business rules
 * - Manage audit logging for state-changing operations
 * - Interact with productRepository
 */
import { productRepository } from '../repositories/productRepository.js';
import { auditLogRepository } from '../../../repositories/auditLogRepository.js';

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
    const product = await productRepository.findByIdAndTenant(id, tenantId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }
    return product;
  },

  /**
   * Create a new product
   */
  async createProduct(data, tenantId, adminUserId, ip) {
    // 1. Ensure tenantId is set correctly from authenticated context
    const productData = {
      ...data,
      tenantId
    };

    // 2. Create in database
    const product = await productRepository.create(productData);

    // 3. Audit Log
    await auditLogRepository.logCRUD(adminUserId, tenantId, 'CREATE', 'PRODUCT', product.id, ip);

    return product;
  },

  /**
   * Update a product
   */
  async updateProduct(id, tenantId, data, adminUserId, ip) {
    // 1. Check if product exists for this tenant
    const product = await productRepository.findByIdAndTenant(id, tenantId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // 2. Update in database
    const updatedProduct = await productRepository.update(id, tenantId, data);

    // 3. Audit Log
    await auditLogRepository.logCRUD(adminUserId, tenantId, 'UPDATE', 'PRODUCT', id, ip);

    return updatedProduct;
  },

  /**
   * Delete a product
   */
  async deleteProduct(id, tenantId, adminUserId, ip) {
    // 1. Check if product exists for this tenant
    const product = await productRepository.findByIdAndTenant(id, tenantId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // 2. Delete from database
    await productRepository.delete(id, tenantId);

    // 3. Audit Log
    await auditLogRepository.logCRUD(adminUserId, tenantId, 'DELETE', 'PRODUCT', id, ip);

    return true;
  },

  /**
   * Toggle product active status
   */
  async toggleProductActive(id, tenantId, adminUserId, ip) {
    // 1. Check if product exists
    const product = await productRepository.findByIdAndTenant(id, tenantId);
    if (!product) {
      throw new Error('Produto não encontrado');
    }

    // 2. Toggle status
    const updatedProduct = await productRepository.toggleActive(id, tenantId);

    // 3. Audit Log
    await auditLogRepository.logCRUD(
      adminUserId, 
      tenantId, 
      updatedProduct.active ? 'ACTIVATE' : 'DEACTIVATE', 
      'PRODUCT', 
      id, 
      ip
    );

    return updatedProduct;
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