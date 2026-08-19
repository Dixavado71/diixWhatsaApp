import { prisma } from '../infrastructure/database/prismaClient.js';

/**
 * Client Repository - Data access layer for Client entity
 * IMPORTANT: All queries must filter by tenantId for data isolation
 */
export const clientRepository = {
  /**
   * Find all clients for a specific tenant
   */
  async findAllByTenant(tenantId, filters = {}) {
    return prisma.client.findMany({
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
   * Find a client by ID for a specific tenant
   */
  async findByIdAndTenant(id, tenantId) {
    return prisma.client.findFirst({
      where: {
        id,
        tenantId
      }
    });
  },

  /**
   * Create a new client
   */
  async create(data) {
    return prisma.client.create({
      data
    });
  },

  /**
   * Update a client (with tenant isolation check)
   */
  async update(id, tenantId, data) {
    const existing = await this.findByIdAndTenant(id, tenantId);
    if (!existing) return null;

    return prisma.client.update({
      where: { id },
      data
    });
  },

  /**
   * Delete a client (with tenant isolation check)
   */
  async delete(id, tenantId) {
    const existing = await this.findByIdAndTenant(id, tenantId);
    if (!existing) return null;

    return prisma.client.delete({
      where: { id }
    });
  },

  /**
   * Toggle client active status
   */
  async toggleActive(id, tenantId) {
    const client = await this.findByIdAndTenant(id, tenantId);
    if (!client) return null;

    return prisma.client.update({
      where: { id },
      data: { active: !client.active }
    });
  },

  /**
   * Count clients for a tenant
   */
  async countByTenant(tenantId, filters = {}) {
    return prisma.client.count({
      where: {
        tenantId,
        ...filters
      }
    });
  },

  /**
   * Search clients within a tenant
   */
  async searchByTenant(tenantId, searchTerm) {
    return prisma.client.findMany({
      where: {
        tenantId,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { phone: { contains: searchTerm, mode: 'insensitive' } },
          { document: { contains: searchTerm, mode: 'insensitive' } }
        ]
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
};
