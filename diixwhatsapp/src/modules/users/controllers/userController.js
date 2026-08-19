/**
 * User Controller - HTTP layer for User operations (API ONLY)
 * Responsibilities:
 * - Receive request
 * - Get authenticated context
 * - Validate input
 * - Call service
 * - Return JSON response
 */
import { userService } from '../services/userService.js';
import { createUserSchema, updateUserSchema } from '../validators/userValidator.js';

export const userController = {
  /**
   * List all users
   */
  listUsers: async (req, res) => {
    try {
      const users = await userService.getAllUsers({});
      
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
   * Get metadata for creating a new user (returns active tenants for dropdown)
   */
  showNewUser: async (req, res) => {
    try {
      // Import tenantService dynamically to avoid circular dependency
      const { tenantService } = await import('../../tenants/services/tenantService.js');
      const tenants = await tenantService.getAllTenants({ active: true });
      
      res.json({
        success: true,
        data: { tenants }
      });
    } catch (error) {
      console.error('Show new user error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar dados para o formulário'
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
      
      const newUser = await userService.createUser(validatedData, adminUserId, ip);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: newUser
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || 'Dados inválidos'
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
      const user = await userService.getUserById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      const { tenantService } = await import('../../tenants/services/tenantService.js');
      const tenants = await tenantService.getAllTenants({ active: true });
      
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

      await userService.updateUser(req.params.id, validatedData, userId, ip);

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: error.errors[0]?.message || 'Dados inválidos'
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

      await userService.deleteUser(req.params.id, userId, ip);

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