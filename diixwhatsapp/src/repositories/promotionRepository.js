import { prisma } from '../config/database.js';

/**
 * Promotion Repository - Data access layer for Promotion entity
 * IMPORTANT: All queries must filter by tenantId for data isolation
 */
export const promotionRepository = {
  /**
   * Find all promotions for a specific tenant
   */
  async findAllByTenant(tenantId, filters = {}) {
    return prisma.promotion.findMany({
      where: {
        tenantId,
        ...(filters.active !== undefined && { active: filters.active })
      },
      orderBy: {
        startDate: 'desc'
      }
    });
  },

  /**
   * Find a promotion by ID for a specific tenant
   */
  async findByIdAndTenant(id, tenantId) {
    return prisma.promotion.findFirst({
      where: {
        id,
        tenantId
      }
    });
  },

  /**
   * Create a new promotion
   */
  async create(data) {
    return prisma.promotion.create({
      data
    });
  },

  /**
   * Update a promotion (with tenant isolation check)
   */
  async update(id, tenantId, data) {
    const existing = await this.findByIdAndTenant(id, tenantId);
    if (!existing) return null;

    return prisma.promotion.update({
      where: { id },
      data
    });
  },

  /**
   * Delete a promotion (with tenant isolation check)
   */
  async delete(id, tenantId) {
    const existing = await this.findByIdAndTenant(id, tenantId);
    if (!existing) return null;

    return prisma.promotion.delete({
      where: { id }
    });
  },

  /**
   * Toggle promotion active status
   */
  async toggleActive(id, tenantId) {
    const promotion = await this.findByIdAndTenant(id, tenantId);
    if (!promotion) return null;

    return prisma.promotion.update({
      where: { id },
      data: { active: !promotion.active }
    });
  },

  /**
   * Count promotions for a tenant
   */
  async countByTenant(tenantId, filters = {}) {
    return prisma.promotion.count({
      where: {
        tenantId,
        ...filters
      }
    });
  },

  /**
   * Get active promotions for a tenant
   */
  async findActiveByTenant(tenantId) {
    const now = new Date();
    return prisma.promotion.findMany({
      where: {
        tenantId,
        active: true,
        startDate: { lte: now },
        endDate: { gte: now }
      },
      orderBy: {
        startDate: 'desc'
      }
    });
  }
};
