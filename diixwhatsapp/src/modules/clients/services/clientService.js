import { clientRepository } from '../repositories/clientRepository.js';

/**
 * Client Service - Business logic layer for Client entity
 */
export const clientService = {
  /**
   * Get all clients for a tenant
   */
  async getAllClients(tenantId, filters = {}) {
    return clientRepository.findAllByTenant(tenantId, filters);
  },

  /**
   * Get a client by ID for a specific tenant
   */
  async getClientById(id, tenantId) {
    return clientRepository.findByIdAndTenant(id, tenantId);
  },

  /**
   * Create a new client
   */
  async createClient(data, tenantId) {
    // Ensure tenantId is set correctly from authenticated context
    const clientData = {
      ...data,
      tenantId
    };

    return clientRepository.create(clientData);
  },

  /**
   * Update a client
   */
  async updateClient(id, tenantId, data) {
    const client = await clientRepository.findByIdAndTenant(id, tenantId);
    
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    return clientRepository.update(id, tenantId, data);
  },

  /**
   * Delete a client
   */
  async deleteClient(id, tenantId) {
    const client = await clientRepository.findByIdAndTenant(id, tenantId);
    
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    return clientRepository.delete(id, tenantId);
  },

  /**
   * Toggle client active status
   */
  async toggleClientActive(id, tenantId) {
    const client = await clientRepository.findByIdAndTenant(id, tenantId);
    
    if (!client) {
      throw new Error('Cliente não encontrado');
    }

    return clientRepository.toggleActive(id, tenantId);
  },

  /**
   * Count clients for a tenant
   */
  async countClients(tenantId, filters = {}) {
    return clientRepository.countByTenant(tenantId, filters);
  },

  /**
   * Search clients within a tenant
   */
  async searchClients(tenantId, searchTerm) {
    return clientRepository.searchByTenant(tenantId, searchTerm);
  }
};
