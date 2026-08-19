import { prisma } from '../infrastructure/database/prismaClient.js';

/**
 * Tenant Repository - Data access layer for Tenant entity
 */
export const tenantRepository = {
  /**
   * Find all tenants with optional filters
   */
  async findAll(filters = {}) {
    return prisma.tenant.findMany({
      where: {
        ...(filters.active !== undefined && { active: filters.active })
      },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            clients: true,
            services: true,
            promotions: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  /**
   * Find a tenant by ID
   */
  async findById(id) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            clients: true,
            services: true,
            promotions: true
          }
        }
      }
    });
  },

  /**
   * Find a tenant by slug
   */
  async findBySlug(slug) {
    return prisma.tenant.findUnique({
      where: { slug },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            clients: true,
            services: true,
            promotions: true
          }
        }
      }
    });
  },

  /**
   * Create a new tenant
   */
  async create(data) {
    return prisma.tenant.create({
      data,
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            clients: true,
            services: true,
            promotions: true
          }
        }
      }
    });
  },

  /**
   * Update a tenant
   */
  async update(id, data) {
    return prisma.tenant.update({
      where: { id },
      data,
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            clients: true,
            services: true,
            promotions: true
          }
        }
      }
    });
  },

  /**
   * Toggle tenant active status
   */
  async toggleActive(id) {
    const tenant = await this.findById(id);
    if (!tenant) return null;

    return prisma.tenant.update({
      where: { id },
      data: { active: !tenant.active },
      include: {
        _count: {
          select: {
            users: true,
            products: true,
            clients: true,
            services: true,
            promotions: true
          }
        }
      }
    });
  },

  /**
   * Delete a tenant
   */
  async delete(id) {
    return prisma.tenant.delete({
      where: { id }
    });
  },

  /**
   * Count tenants
   */
  async count(filters = {}) {
    return prisma.tenant.count({
      where: filters
    });
  },

  /**
   * Get dashboard statistics
   */
  async getStats() {
    const total = await prisma.tenant.count();
    const active = await prisma.tenant.count({ where: { active: true } });
    const inactive = await prisma.tenant.count({ where: { active: false } });

    return { total, active, inactive };
  }
};
