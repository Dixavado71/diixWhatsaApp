/**
 * Service Service - Business logic layer for Service entity
 * 
 * REFACTORED: Adiciona aliases para métodos CRUD genéricos
 * para compatibilidade com createCRUDController.
 */
import { serviceRepository } from '../repositories/serviceRepository.js';

export const serviceService = {
  /**
   * Get all services for a tenant with optional filters
   */
  async getAllServices(tenantId, filters = {}) {
    return serviceRepository.findAllByTenant(tenantId, filters);
  },

  /**
   * Alias para getAllServices - usado pelo BaseController
   */
  async getAll(tenantId, filters = {}) {
    return this.getAllServices(tenantId, filters);
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
   * Alias para getServiceById - usado pelo BaseController
   */
  async getById(id, tenantId) {
    return this.getServiceById(id, tenantId);
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
   * Alias para createService - usado pelo BaseController
   * Assinatura: create(data, tenantId, userId, ip)
   */
  async create(data, tenantId, userId, ip) {
    return this.createService(tenantId, data);
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
   * Alias para updateService - usado pelo BaseController
   * Assinatura: update(id, tenantId, data, userId, ip)
   */
  async update(id, tenantId, data, userId, ip) {
    return this.updateService(id, tenantId, data);
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
   * Alias para deleteService - usado pelo BaseController
   * Assinatura: delete(id, tenantId, userId, ip)
   */
  async delete(id, tenantId, userId, ip) {
    return this.deleteService(id, tenantId);
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
