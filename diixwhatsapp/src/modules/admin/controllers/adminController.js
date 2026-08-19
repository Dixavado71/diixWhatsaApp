/**
 * Admin Controller - Handle Master admin operations (API ONLY)
 * Only handles HTTP concerns (req, res, next)
 * Delegates business logic to adminService
 */
import { adminService } from '../services/adminService.js';
import { createTenantSchema, updateTenantSchema } from '../../tenants/validators/tenantValidator.js';
import { createUserSchema, updateUserSchema } from '../../../validators/authValidator.js';

export const adminController = {
  /**
   * Get admin dashboard stats and data
   */
  dashboard: async (req, res) => {
    try {
      const stats = await adminService.getDashboardStats();
      const allTenants = await adminService.getAllTenants({});
      const recentTenants = allTenants.slice(0, 10);

      res.json({
        success: true,
        data: { stats, tenants: allTenants, recentTenants }
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar dashboard'
      });
    }
  },

  /**
   * List all tenants
   */
  listTenants: async (req, res) => {
    try {
      const tenants = await adminService.getAllTenants();
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
   * Get metadata/info for creating a new tenant (API equivalent of show form)
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

      const tenant = await adminService.createTenant(validatedData, userId, ip);

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
   * Get tenant data for editing (API equivalent of show edit form)
   */
  showEditTenant: async (req, res) => {
    try {
      const tenant = await adminService.getTenantById(req.params.id);
      
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

      await adminService.updateTenant(req.params.id, validatedData, userId, ip);

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

      const tenant = await adminService.toggleTenantActive(req.params.id, userId, ip);

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

      await adminService.deleteTenant(req.params.id, userId, ip);

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
  },

  /**
   * List all users
   */
  listUsers: async (req, res) => {
    try {
      const users = await adminService.getAllUsers({});
      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      console.error('List users error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar usuários'
      });
    }
  },

  /**
   * Get metadata (like active tenants list) for creating a new user
   */
  showNewUser: async (req, res) => {
    try {
      const tenants = await adminService.getAllTenants({ active: true });
      res.json({
        success: true,
        data: { tenants }
      });
    } catch (error) {
      console.error('Show new user error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar dados para formulário'
      });
    }
  },

  /**
   * Create new user
   */
  createUser: async (req, res) => {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const adminUserId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;
      
      const newUser = await adminService.createUser(validatedData, adminUserId, ip);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: newUser
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }

      console.error('Create user error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar usuário'
      });
    }
  },

  /**
   * Get user data and active tenants for editing
   */
  showEditUser: async (req, res) => {
    try {
      const user = await adminService.getUserById(req.params.id);
      const tenants = await adminService.getAllTenants({ active: true });
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        data: { user, tenants }
      });
    } catch (error) {
      console.error('Show edit user error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar dados do usuário'
      });
    }
  },

  /**
   * Update user
   */
  updateUser: async (req, res) => {
    try {
      const validatedData = updateUserSchema.parse(req.body);
      const userId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      await adminService.updateUser(req.params.id, validatedData, userId, ip);

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }

      console.error('Update user error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao atualizar usuário'
      });
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (req, res) => {
    try {
      const userId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      await adminService.deleteUser(req.params.id, userId, ip);

      res.json({
        success: true,
        message: 'Usuário excluído com sucesso'
      });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao excluir usuário'
      });
    }
  }
};