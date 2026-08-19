import { serviceRepository } from '../repositories/serviceRepository.js';

/**
 * Service Service - Business logic layer for Service entity
 */
export const serviceService = {
  /**
   * Get all services for a tenant with optional filters
   */
  async getAllServices(tenantId, filters = {}) {
    return serviceRepository.findAllByTenant(tenantId, filters);
  },

  /**
   * Get a single service by ID with tenant isolation
   */
  async getServiceById(id, tenantId) {
    const service = await serviceRepository.findByIdAndTenant(id, tenantId);
    if (!service) {
      throw new Error('Service not found');
    }
    return service;
  },

  /**
   * Create a new service
   */
  async createService(tenantId, data) {
    // Ensure tenantId is set correctly from context, not from body
    const serviceData = {
      ...data,
      tenantId
    };
    
    return serviceRepository.create(serviceData);
  },

  /**
   * Update an existing service with tenant isolation
   */
  async updateService(id, tenantId, data) {
    const service = await serviceRepository.update(id, tenantId, data);
    if (!service) {
      throw new Error('Service not found or update failed');
    }
    return service;
  },

  /**
   * Delete a service with tenant isolation
   */
  async deleteService(id, tenantId) {
    const deleted = await serviceRepository.delete(id, tenantId);
    if (!deleted) {
      throw new Error('Service not found or delete failed');
    }
    return deleted;
  },

  /**
   * Toggle service active status
   */
  async toggleServiceStatus(id, tenantId) {
    const service = await serviceRepository.toggleActive(id, tenantId);
    if (!service) {
      throw new Error('Service not found');
    }
    return service;
  },

  /**
   * Count services for a tenant
   */
  async countServices(tenantId, filters = {}) {
    return serviceRepository.countByTenant(tenantId, filters);
  },

  /**
   * Search services within a tenant
   */
  async searchServices(tenantId, searchTerm) {
    return serviceRepository.searchByTenant(tenantId, searchTerm);
  }
};

