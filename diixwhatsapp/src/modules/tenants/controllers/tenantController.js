import { tenantService } from '../services/tenantService.js';
import { createTenantSchema, updateTenantSchema } from '../validators/tenantValidator.js';
import { auditLogRepository } from '../../../repositories/auditLogRepository.js';

/**
 * Tenant Controller - Handle HTTP requests for Tenant entity (Admin operations)
 * Responsibilities:
 * - Receive request
 * - Get authenticated context (MASTER role required)
 * - Validate input
 * - Call service
 * - Return JSON response
 */
export const tenantController = {
  /**
   * List all tenants
   */
  listTenants: async (req, res) => {
    try {
      const tenants = await tenantService.getAllTenants();
      res.json({
        success: true,
        data: { tenants }
      });
    } catch (error) {
      console.error('List tenants error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar lojas'
      });
    }
  },

  /**
   * Show new tenant metadata (API equivalent of show form)
   */
  showNewTenant: (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint pronto. Envie um POST com os dados da nova loja.'
    });
  },

  /**
   * Create new tenant
   */
  createTenant: async (req, res) => {
    try {
      const validatedData = createTenantSchema.parse(req.body);
      const userId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      const tenant = await tenantService.createTenant(validatedData, userId, ip);

      // Log creation
      await auditLogRepository.logCRUD(userId, tenant.id, 'CREATE', 'TENANT', tenant.id, ip);

      res.status(201).json({
        success: true,
        message: 'Loja criada com sucesso',
        data: tenant
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }

      console.error('Create tenant error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar loja'
      });
    }
  },

  /**
   * Show edit tenant data (API equivalent of show edit form)
   */
  showEditTenant: async (req, res) => {
    try {
      const tenant = await tenantService.getTenantById(req.params.id);
      
      if (!tenant) {
        return res.status(404).json({
          success: false,
          error: 'Loja não encontrada'
        });
      }

      res.json({
        success: true,
        data: { tenant }
      });
    } catch (error) {
      console.error('Show edit tenant error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar dados da loja'
      });
    }
  },

  /**
   * Update tenant
   */
  updateTenant: async (req, res) => {
    try {
      const validatedData = updateTenantSchema.parse(req.body);
      const userId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      await tenantService.updateTenant(req.params.id, validatedData, userId, ip);

      // Log update
      await auditLogRepository.logCRUD(userId, req.params.id, 'UPDATE', 'TENANT', req.params.id, ip);

      res.json({
        success: true,
        message: 'Loja atualizada com sucesso'
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }

      console.error('Update tenant error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao atualizar loja'
      });
    }
  },

  /**
   * Toggle tenant active status
   */
  toggleTenant: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      const tenant = await tenantService.toggleTenantActive(req.params.id, userId, ip);

      // Log action
      await auditLogRepository.logCRUD(userId, req.params.id, tenant.active ? 'ACTIVATE' : 'DEACTIVATE', 'TENANT', req.params.id, ip);

      res.json({
        success: true,
        message: 'Status da loja atualizado com sucesso',
        data: tenant
      });
    } catch (error) {
      console.error('Toggle tenant error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao atualizar status da loja'
      });
    }
  },

  /**
   * Delete tenant
   */
  deleteTenant: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      await tenantService.deleteTenant(req.params.id);

      // Log deletion
      await auditLogRepository.logCRUD(userId, req.params.id, 'DELETE', 'TENANT', req.params.id, ip);

      res.json({
        success: true,
        message: 'Loja excluída com sucesso'
      });
    } catch (error) {
      console.error('Delete tenant error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao excluir loja'
      });
    }
  }
};