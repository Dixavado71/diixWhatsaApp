/**
 * User Controller - HTTP layer for User operations
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
      
      res.render('admin/users/index', {
        title: 'Gerenciar Usuários',
        users
      });
    } catch (error) {
      console.error('List users error:', error);
      res.render('admin/users/index', {
        title: 'Gerenciar Usuários',
        users: [],
        error: 'Erro ao carregar usuários'
      });
    }
  },

  /**
   * Show new user form
   */
  showNewUser: async (req, res) => {
    try {
      // Import tenantService dynamically to avoid circular dependency
      const { tenantService } = await import('../../tenants/services/tenantService.js');
      const tenants = await tenantService.getAllTenants({ active: true });
      
      res.render('admin/users/new', {
        title: 'Novo Usuário',
        user: null,
        tenants,
        error: null
      });
    } catch (error) {
      console.error('Show new user error:', error);
      res.render('admin/users/new', {
        title: 'Novo Usuário',
        user: null,
        tenants: [],
        error: 'Erro ao carregar formulário'
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
      
      await userService.createUser(validatedData, adminUserId, ip);

      res.redirect('/admin/users');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        const { tenantService } = await import('../../tenants/services/tenantService.js');
        const tenants = await tenantService.getAllTenants({ active: true });
        return res.render('admin/users/new', {
          title: 'Novo Usuário',
          user: req.body,
          tenants,
          error: errorMessage
        });
      }

      console.error('Create user error:', error);
      const { tenantService } = await import('../../tenants/services/tenantService.js');
      const tenants = await tenantService.getAllTenants({ active: true });
      res.render('admin/users/new', {
        title: 'Novo Usuário',
        user: req.body,
        tenants,
        error: error.message || 'Erro ao criar usuário'
      });
    }
  },

  /**
   * Show edit user form
   */
  showEditUser: async (req, res) => {
    try {
      const user = await userService.getUserById(req.params.id);
      const { tenantService } = await import('../../tenants/services/tenantService.js');
      const tenants = await tenantService.getAllTenants({ active: true });
      
      if (!user) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Usuário não encontrado'
        });
      }

      res.render('admin/users/edit', {
        title: 'Editar Usuário',
        user,
        tenants
      });
    } catch (error) {
      console.error('Show edit user error:', error);
      res.redirect('/admin/users');
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

      res.redirect('/admin/users');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        const user = await userService.getUserById(req.params.id);
        const { tenantService } = await import('../../tenants/services/tenantService.js');
        const tenants = await tenantService.getAllTenants({ active: true });
        return res.render('admin/users/edit', {
          title: 'Editar Usuário',
          user,
          tenants,
          error: errorMessage
        });
      }

      console.error('Update user error:', error);
      res.render('admin/users/edit', {
        title: 'Editar Usuário',
        user: await userService.getUserById(req.params.id),
        tenants: await (async () => {
          try {
            const { tenantService } = await import('../../tenants/services/tenantService.js');
            return await tenantService.getAllTenants({ active: true });
          } catch {
            return [];
          }
        })(),
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

      res.redirect('/admin/users');
    } catch (error) {
      console.error('Delete user error:', error);
      res.redirect('/admin/users');
    }
  }
};

