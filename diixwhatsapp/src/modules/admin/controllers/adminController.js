/**
 * Admin Controller - Handle Master admin operations
 * Only handles HTTP concerns (req, res, next)
 * Delegates business logic to adminService
 */
import { adminService } from '../services/adminService.js';
import { createTenantSchema, updateTenantSchema } from '../../validators/tenantValidator.js';
import { createUserSchema, updateUserSchema } from '../../validators/authValidator.js';

export const adminController = {
  /**
   * Show admin dashboard
   */
  dashboard: async (req, res) => {
    try {
      const stats = await adminService.getDashboardStats();
      
      // Get recent tenants
      const allTenants = await adminService.getAllTenants({});
      const recentTenants = allTenants.slice(0, 10);

      res.render('admin/dashboard', {
        title: 'Dashboard Admin',
        stats,
        tenants: allTenants,
        recentTenants
      });
    } catch (error) {
      console.error('Dashboard error:', error);
      res.render('admin/dashboard', {
        title: 'Dashboard Admin',
        stats: { total: 0, active: 0, inactive: 0, totalUsers: 0 },
        tenants: [],
        recentTenants: [],
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

      const tenant = await adminService.createTenant(validatedData, userId, ip);

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
      const tenant = await adminService.getTenantById(req.params.id);
      
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

      await adminService.updateTenant(req.params.id, validatedData, userId, ip);

      res.redirect('/admin/tenants');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        const tenant = await adminService.getTenantById(req.params.id);
        return res.render('admin/tenants/edit', {
          title: 'Editar Loja',
          tenant,
          error: errorMessage
        });
      }

      console.error('Update tenant error:', error);
      res.render('admin/tenants/edit', {
        title: 'Editar Loja',
        tenant: await adminService.getTenantById(req.params.id),
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

      await adminService.deleteTenant(req.params.id);

      res.redirect('/admin/tenants');
    } catch (error) {
      console.error('Delete tenant error:', error);
      res.redirect('/admin/tenants');
    }
  },

  /**
   * List all users
   */
  listUsers: async (req, res) => {
    try {
      const users = await adminService.getAllUsers({});
      
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
      const tenants = await adminService.getAllTenants({ active: true });
      
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
      
      await adminService.createUser(validatedData, adminUserId, ip);

      res.redirect('/admin/users');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        const tenants = await adminService.getAllTenants({ active: true });
        return res.render('admin/users/new', {
          title: 'Novo Usuário',
          user: req.body,
          tenants,
          error: errorMessage
        });
      }

      console.error('Create user error:', error);
      const tenants = await adminService.getAllTenants({ active: true });
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
      const user = await adminService.getUserById(req.params.id);
      const tenants = await adminService.getAllTenants({ active: true });
      
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

      await adminService.updateUser(req.params.id, validatedData, userId, ip);

      res.redirect('/admin/users');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        const user = await adminService.getUserById(req.params.id);
        const tenants = await adminService.getAllTenants({ active: true });
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
        user: await adminService.getUserById(req.params.id),
        tenants: await adminService.getAllTenants({ active: true }),
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

      res.redirect('/admin/users');
    } catch (error) {
      console.error('Delete user error:', error);
      res.redirect('/admin/users');
    }
  }
};
