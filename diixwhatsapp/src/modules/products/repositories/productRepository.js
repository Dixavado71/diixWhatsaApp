import { prisma } from '../../../infrastructure/database/prismaClient.js';

/**
 * Product Repository - Data access layer for Product entity
 * IMPORTANT: All queries must filter by tenantId for data isolation
 */
export const productRepository = {
  /**
   * Find all products for a specific tenant
   * @param {string} tenantId - Tenant ID (required for isolation)
   */
  async findAllByTenant(tenantId, filters = {}) {
    return prisma.product.findMany({
      where: {
        tenantId, // CRITICAL: Always filter by tenantId
        ...(filters.active !== undefined && { active: filters.active })
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  /**
   * Find a product by ID for a specific tenant
   * @param {string} id - Product ID
   * @param {string} tenantId - Tenant ID (required for isolation)
   */
  async findByIdAndTenant(id, tenantId) {
    return prisma.product.findFirst({
      where: {
        id,
        tenantId // CRITICAL: Ensure product belongs to tenant
      }
    });
  },

  /**
   * Find a product by slug for a specific tenant
   */
  async findBySlugAndTenant(slug, tenantId) {
    return prisma.product.findFirst({
      where: {
        slug,
        tenantId
      }
    });
  },

  /**
   * Create a new product
   * @param {Object} data - Product data including tenantId
   */
  async create(data) {
    return prisma.product.create({
      data
    });
  },

  /**
   * Update a product (with tenant isolation check)
   */
  async update(id, tenantId, data) {
    // First verify the product belongs to this tenant
    const existing = await this.findByIdAndTenant(id, tenantId);
    if (!existing) {
      return null;
    }

    return prisma.product.update({
      where: { id },
      data
    });
  },

  /**
   * Delete a product (with tenant isolation check)
   */
  async delete(id, tenantId) {
    // First verify the product belongs to this tenant
    const existing = await this.findByIdAndTenant(id, tenantId);
    if (!existing) {
      return null;
    }

    return prisma.product.delete({
      where: { id }
    });
  },

  /**
   * Toggle product active status
   */
  async toggleActive(id, tenantId) {
    const product = await this.findByIdAndTenant(id, tenantId);
    if (!product) return null;

    return prisma.product.update({
      where: { id },
      data: { active: !product.active }
    });
  },

  /**
   * Count products for a tenant
   */
  async countByTenant(tenantId, filters = {}) {
    return prisma.product.count({
      where: {
        tenantId,
        ...filters
      }
    });
  },

  /**
   * Search products within a tenant
   */
  async searchByTenant(tenantId, searchTerm) {
    return prisma.product.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } },
          { sku: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
};

