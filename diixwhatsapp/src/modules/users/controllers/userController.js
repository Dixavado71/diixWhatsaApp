/**
 * User Controller - HTTP layer for User operations (API ONLY)
 * Responsibilities:
 * - Receive request
 * - Get authenticated context from req.auth (injected by extractAuthContext middleware)
 * - Validate input
 * - Call service with userContext for tenant isolation
 * - Delegate errors to global handler
 */
import { userService } from '../services/userService.js';
import { tenantService } from '../../tenants/services/tenantService.js';
import { createUserSchema, updateUserSchema } from '../validators/userValidator.js';

export const userController = {
  /**
   * List all users
   * MASTER: Sees all users
   * TENANT_ADMIN: Sees only users from their tenant
   */
  listUsers: async (req, res, next) => {
    try {
      const users = await userService.getAllUsers({}, req.auth);

      res.json({
        success: true,
        data: { users }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get metadata for creating a new user (returns active tenants for dropdown)
   * MASTER: Sees all tenants
   * TENANT_ADMIN: Only sees their own tenant info
   */
  showNewUser: async (req, res, next) => {
    try {
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
   * MASTER: Can create users for any tenant
   * TENANT_ADMIN: Can only create users for their own tenant
   */
  createUser: async (req, res, next) => {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const adminUserId = req.auth.userId;
      const ip = req.auth.ip;

      const newUser = await userService.createUser(validatedData, adminUserId, ip, req.auth);

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get user data and active tenants for editing
   * MASTER: Can edit any user
   * TENANT_ADMIN: Can only edit users from their tenant
   */
  showEditUser: async (req, res, next) => {
    try {
      const user = await userService.getUserById(req.params.id, req.auth);

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
   * MASTER: Can update any user
   * TENANT_ADMIN: Can only update users from their tenant
   */
  updateUser: async (req, res, next) => {
    try {
      const validatedData = updateUserSchema.parse(req.body);
      const adminUserId = req.auth.userId;
      const ip = req.auth.ip;

      await userService.updateUser(req.params.id, validatedData, adminUserId, ip, req.auth);

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
   * MASTER: Can delete any user
   * TENANT_ADMIN: Can only delete users from their tenant
   */
  deleteUser: async (req, res, next) => {
    try {
      const adminUserId = req.auth.userId;
      const ip = req.auth.ip;

      await userService.deleteUser(req.params.id, adminUserId, ip, req.auth);

      res.json({
        success: true,
        message: 'Usuário excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
};
