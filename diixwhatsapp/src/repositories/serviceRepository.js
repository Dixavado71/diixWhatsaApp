import { prisma } from '../config/database.js';

/**
 * Service Repository - Data access layer for Service entity
 * IMPORTANT: All queries must filter by tenantId for data isolation
 */
export const serviceRepository = {
  /**
   * Find all services for a specific tenant
   */
  async findAllByTenant(tenantId, filters = {}) {
    return prisma.service.findMany({
      where: {
        tenantId,
        ...(filters.active !== undefined && { active: filters.active })
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  /**
   * Find a service by ID for a specific tenant
   */
  async findByIdAndTenant(id, tenantId) {
    return prisma.service.findFirst({
      where: {
        id,
        tenantId
      }
    });
  },

  /**
   * Create a new service
   */
  async create(data) {
    return prisma.service.create({
      data
    });
  },

  /**
   * Update a service (with tenant isolation check)
   */
  async update(id, tenantId, data) {
    const existing = await this.findByIdAndTenant(id, tenantId);
    if (!existing) return null;

    return prisma.service.update({
      where: { id },
      data
    });
  },

  /**
   * Delete a service (with tenant isolation check)
   */
  async delete(id, tenantId) {
    const existing = await this.findByIdAndTenant(id, tenantId);
    if (!existing) return null;

    return prisma.service.delete({
      where: { id }
    });
  },

  /**
   * Toggle service active status
   */
  async toggleActive(id, tenantId) {
    const service = await this.findByIdAndTenant(id, tenantId);
    if (!service) return null;

    return prisma.service.update({
      where: { id },
      data: { active: !service.active }
    });
  },

  /**
   * Count services for a tenant
   */
  async countByTenant(tenantId, filters = {}) {
    return prisma.service.count({
      where: {
        tenantId,
        ...filters
      }
    });
  },

  /**
   * Search services within a tenant
   */
  async searchByTenant(tenantId, searchTerm) {
    return prisma.service.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
};
