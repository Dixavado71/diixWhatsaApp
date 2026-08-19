import { tenantRepository } from '../repositories/tenantRepository.js';
import { generateSlug } from '../../../shared/helpers/slug.js';

/**
 * Tenant Service - Business logic for Tenant operations
 */
export const tenantService = {
  /**
   * Get all tenants with statistics
   */
  async getAllTenants(filters = {}) {
    return tenantRepository.findAll(filters);
  },

  /**
   * Get a single tenant by ID
   */
  async getTenantById(id) {
    return tenantRepository.findById(id);
  },

  /**
   * Get a single tenant by slug
   */
  async getTenantBySlug(slug) {
    return tenantRepository.findBySlug(slug);
  },

  /**
   * Create a new tenant
   */
  async createTenant(data, userId, ip) {
    // Generate slug if not provided
    if (!data.slug) {
      data.slug = generateSlug(data.name);
    }

    // Check if slug already exists
    const existingSlug = await tenantRepository.findBySlug(data.slug);
    if (existingSlug) {
      // Add timestamp to make it unique
      data.slug = `${data.slug}-${Date.now()}`;
    }

    const tenant = await tenantRepository.create(data);

    // Log creation would be done in the controller

    return tenant;
  },

  /**
   * Update a tenant
   */
  async updateTenant(id, data, userId, ip) {
    // If slug is being updated, check uniqueness
    if (data.slug) {
      const existingSlug = await tenantRepository.findBySlug(data.slug);
      if (existingSlug && existingSlug.id !== id) {
        throw new Error('Slug já está em uso');
      }
    }

    return tenantRepository.update(id, data);
  },

  /**
   * Toggle tenant active status
   */
  async toggleTenantActive(id, userId, ip) {
    return tenantRepository.toggleActive(id);
  },

  /**
   * Delete a tenant
   */
  async deleteTenant(id) {
    // Check if tenant has users
    const tenant = await tenantRepository.findById(id);
    if (!tenant) {
      throw new Error('Loja não encontrada');
    }

    // Prefer soft delete by deactivating
    if (tenant._count.users > 0 || tenant._count.products > 0) {
      // Has related data, prefer to deactivate instead of delete
      return tenantRepository.toggleActive(id);
    }

    return tenantRepository.delete(id);
  },

  /**
   * Get tenant statistics for dashboard
   */
  async getDashboardStats() {
    const tenantStats = await tenantRepository.getStats();
    const userCount = await import('../../../repositories/userRepository.js')
      .then(m => m.userRepository.count());

    return {
      ...tenantStats,
      totalUsers: userCount
    };
  }
};
