/**
 * User Controller - HTTP layer for User operations (API ONLY)
 * Responsibilities:
 * - Receive request
 * - Get authenticated context
 * - Validate input
 * - Call service
 * - Delegate errors to global handler
 */
import { userService } from '../services/userService.js';
import { tenantService } from '../../tenants/services/tenantService.js'; // Import estático seguro
import { createUserSchema, updateUserSchema } from '../validators/userValidator.js';

export const userController = {
  /**
   * List all users
   */
  listUsers: async (req, res, next) => {
    try {
      const users = await userService.getAllUsers({});
      
      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      next(error); // Delegado ao errorHandler global
    }
  },

  /**
   * Get metadata for creating a new user (returns active tenants for dropdown)
   */
  showNewUser: async (req, res, next) => {
    try {
      // Import estático resolve a necessidade do dynamic import anterior
      const tenants = await tenantService.getAllTenants({ active: true });
      
      res.json({
        success: true,
        data: { tenants }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new user
   */
  createUser: async (req, res, next) => {
    try {
      // Se falhar, o Zod lança ZodError, que será capturado automaticamente pelo catch abaixo
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
      next(error); // O middleware global agora trata o ZodError e outros erros
    }
  },

  /**
   * Get user data and active tenants for editing
   */
  showEditUser: async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.params.id);
      
      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      const tenants = await tenantService.getAllTenants({ active: true });
      
      res.json({
        success: true,
        data: { user, tenants }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update user
   */
  updateUser: async (req, res, next) => {
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
      next(error);
    }
  },

  /**
   * Delete user
   */
  deleteUser: async (req, res, next) => {
    try {
      const userId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      await userService.deleteUser(req.params.id, userId, ip);

      res.json({
        success: true,
        message: 'Usuário excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
};