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
 * - Return response
 */
export const tenantController = {
  /**
   * List all tenants
   */
  listTenants: async (req, res) => {
    try {
      const tenants = await tenantService.getAllTenants();
      
      res.render('admin/tenants/index', {
        title: 'Gerenciar Lojas',
        tenants
      });
    } catch (error) {
      console.error('List tenants error:', error);
      res.render('admin/tenants/index', {
        title: 'Gerenciar Lojas',
        tenants: [],
        error: 'Erro ao carregar lojas'
      });
    }
  },

  /**
   * Show new tenant form
   */
  showNewTenant: (req, res) => {
    res.render('admin/tenants/new', {
      title: 'Nova Loja',
      tenant: null,
      error: null
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

      res.redirect('/admin/tenants');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.render('admin/tenants/new', {
          title: 'Nova Loja',
          tenant: req.body,
          error: errorMessage
        });
      }

      console.error('Create tenant error:', error);
      res.render('admin/tenants/new', {
        title: 'Nova Loja',
        tenant: req.body,
        error: error.message || 'Erro ao criar loja'
      });
    }
  },

  /**
   * Show edit tenant form
   */
  showEditTenant: async (req, res) => {
    try {
      const tenant = await tenantService.getTenantById(req.params.id);
      
      if (!tenant) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Loja não encontrada'
        });
      }

      res.render('admin/tenants/edit', {
        title: 'Editar Loja',
        tenant
      });
    } catch (error) {
      console.error('Show edit tenant error:', error);
      res.redirect('/admin/tenants');
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

      res.redirect('/admin/tenants');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        const tenant = await tenantService.getTenantById(req.params.id);
        return res.render('admin/tenants/edit', {
          title: 'Editar Loja',
          tenant,
          error: errorMessage
        });
      }

      console.error('Update tenant error:', error);
      res.render('admin/tenants/edit', {
        title: 'Editar Loja',
        tenant: await tenantService.getTenantById(req.params.id),
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

      res.redirect('/admin/tenants');
    } catch (error) {
      console.error('Toggle tenant error:', error);
      res.redirect('/admin/tenants');
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

      res.redirect('/admin/tenants');
    } catch (error) {
      console.error('Delete tenant error:', error);
      res.redirect('/admin/tenants');
    }
  }
};
