import { productRepository } from '../repositories/productRepository.js';
import { clientRepository } from '../repositories/clientRepository.js';
import { serviceRepository } from '../repositories/serviceRepository.js';
import { promotionRepository } from '../repositories/promotionRepository.js';
import { userRepository } from '../repositories/userRepository.js';
import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { generateSlug } from '../utils/slug.js';
import { hashPassword } from '../utils/password.js';
import { createProductSchema, updateProductSchema } from '../validators/productValidator.js';
import { createClientSchema, updateClientSchema } from '../validators/clientValidator.js';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceValidator.js';
import { createPromotionSchema, updatePromotionSchema } from '../validators/promotionValidator.js';
import { createTenantUserSchema, updateTenantUserSchema } from '../validators/authValidator.js';

/**
 * Tenant Controller - Handle tenant dashboard and operations
 */
export const tenantController = {
  /**
   * Show tenant dashboard
   */
  dashboard: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;

      // Get counts for this tenant only
      const [productsCount, clientsCount, servicesCount, promotionsCount, usersCount] = await Promise.all([
        productRepository.countByTenant(tenantId),
        clientRepository.countByTenant(tenantId),
        serviceRepository.countByTenant(tenantId),
        promotionRepository.countByTenant(tenantId),
        userRepository.count({ tenantId })
      ]);

      // Get recent items
      const [recentProducts, recentClients] = await Promise.all([
        productRepository.findAllByTenant(tenantId, {}).then(items => items.slice(0, 5)),
        clientRepository.findAllByTenant(tenantId, {}).then(items => items.slice(0, 5))
      ]);

      res.render('tenant/dashboard', {
        title: 'Dashboard',
        stats: {
          products: productsCount,
          clients: clientsCount,
          services: servicesCount,
          promotions: promotionsCount,
          users: usersCount
        },
        recentProducts,
        recentClients
      });
    } catch (error) {
      console.error('Tenant dashboard error:', error);
      res.render('tenant/dashboard', {
        title: 'Dashboard',
        stats: { products: 0, clients: 0, services: 0, promotions: 0, users: 0 },
        recentProducts: [],
        recentClients: [],
        error: 'Erro ao carregar dashboard'
      });
    }
  },

  /**
   * Products CRUD
   */
  listProducts: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const products = await productRepository.findAllByTenant(tenantId);

      res.render('tenant/products/index', {
        title: 'Produtos',
        products
      });
    } catch (error) {
      console.error('List products error:', error);
      res.render('tenant/products/index', {
        title: 'Produtos',
        products: [],
        error: 'Erro ao carregar produtos'
      });
    }
  },

  showNewProduct: (req, res) => {
    res.render('tenant/products/new', {
      title: 'Novo Produto',
      product: null,
      error: null
    });
  },

  createProduct: async (req, res) => {
    try {
      const validatedData = createProductSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      // Generate slug if not provided
      if (!validatedData.slug) {
        validatedData.slug = generateSlug(validatedData.name);
      }

      validatedData.tenantId = tenantId;

      const product = await productRepository.create(validatedData);

      // Log creation
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'CREATE',
        'PRODUCT',
        product.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/products');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.render('tenant/products/new', {
          title: 'Novo Produto',
          product: req.body,
          error: errorMessage
        });
      }

      console.error('Create product error:', error);
      res.render('tenant/products/new', {
        title: 'Novo Produto',
        product: req.body,
        error: error.message || 'Erro ao criar produto'
      });
    }
  },

  showEditProduct: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const product = await productRepository.findByIdAndTenant(req.params.id, tenantId);

      if (!product) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Produto não encontrado'
        });
      }

      res.render('tenant/products/edit', {
        title: 'Editar Produto',
        product
      });
    } catch (error) {
      console.error('Show edit product error:', error);
      res.redirect('/tenant/products');
    }
  },

  updateProduct: async (req, res) => {
    try {
      const validatedData = updateProductSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      const product = await productRepository.update(req.params.id, tenantId, validatedData);

      if (!product) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Produto não encontrado'
        });
      }

      // Log update
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'UPDATE',
        'PRODUCT',
        product.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/products');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        const product = await productRepository.findByIdAndTenant(req.params.id, req.session.user.tenantId);
        return res.render('tenant/products/edit', {
          title: 'Editar Produto',
          product,
          error: errorMessage
        });
      }

      console.error('Update product error:', error);
      res.render('tenant/products/edit', {
        title: 'Editar Produto',
        product: await productRepository.findByIdAndTenant(req.params.id, req.session.user.tenantId),
        error: error.message || 'Erro ao atualizar produto'
      });
    }
  },

  deleteProduct: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;

      await productRepository.delete(req.params.id, tenantId);

      // Log deletion
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'DELETE',
        'PRODUCT',
        req.params.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/products');
    } catch (error) {
      console.error('Delete product error:', error);
      res.redirect('/tenant/products');
    }
  },

  /**
   * Clients CRUD
   */
  listClients: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const clients = await clientRepository.findAllByTenant(tenantId);

      res.render('tenant/clients/index', {
        title: 'Clientes',
        clients
      });
    } catch (error) {
      console.error('List clients error:', error);
      res.render('tenant/clients/index', {
        title: 'Clientes',
        clients: [],
        error: 'Erro ao carregar clientes'
      });
    }
  },

  showNewClient: (req, res) => {
    res.render('tenant/clients/new', {
      title: 'Novo Cliente',
      client: null,
      error: null
    });
  },

  createClient: async (req, res) => {
    try {
      const validatedData = createClientSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      validatedData.tenantId = tenantId;

      const client = await clientRepository.create(validatedData);

      // Log creation
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'CREATE',
        'CLIENT',
        client.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/clients');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.render('tenant/clients/new', {
          title: 'Novo Cliente',
          client: req.body,
          error: errorMessage
        });
      }

      console.error('Create client error:', error);
      res.render('tenant/clients/new', {
        title: 'Novo Cliente',
        client: req.body,
        error: error.message || 'Erro ao criar cliente'
      });
    }
  },

  showEditClient: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const client = await clientRepository.findByIdAndTenant(req.params.id, tenantId);

      if (!client) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Cliente não encontrado'
        });
      }

      res.render('tenant/clients/edit', {
        title: 'Editar Cliente',
        client
      });
    } catch (error) {
      console.error('Show edit client error:', error);
      res.redirect('/tenant/clients');
    }
  },

  updateClient: async (req, res) => {
    try {
      const validatedData = updateClientSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      const client = await clientRepository.update(req.params.id, tenantId, validatedData);

      if (!client) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Cliente não encontrado'
        });
      }

      // Log update
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'UPDATE',
        'CLIENT',
        client.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/clients');
    } catch (error) {
      console.error('Update client error:', error);
      res.render('tenant/clients/edit', {
        title: 'Editar Cliente',
        client: await clientRepository.findByIdAndTenant(req.params.id, req.session.user.tenantId),
        error: error.message || 'Erro ao atualizar cliente'
      });
    }
  },

  deleteClient: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;

      await clientRepository.delete(req.params.id, tenantId);

      // Log deletion
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'DELETE',
        'CLIENT',
        req.params.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/clients');
    } catch (error) {
      console.error('Delete client error:', error);
      res.redirect('/tenant/clients');
    }
  },

  /**
   * Services CRUD
   */
  listServices: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const services = await serviceRepository.findAllByTenant(tenantId);

      res.render('tenant/services/index', {
        title: 'Serviços',
        services
      });
    } catch (error) {
      console.error('List services error:', error);
      res.render('tenant/services/index', {
        title: 'Serviços',
        services: [],
        error: 'Erro ao carregar serviços'
      });
    }
  },

  showNewService: (req, res) => {
    res.render('tenant/services/new', {
      title: 'Novo Serviço',
      service: null,
      error: null
    });
  },

  createService: async (req, res) => {
    try {
      const validatedData = createServiceSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      validatedData.tenantId = tenantId;

      const service = await serviceRepository.create(validatedData);

      // Log creation
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'CREATE',
        'SERVICE',
        service.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/services');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.render('tenant/services/new', {
          title: 'Novo Serviço',
          service: req.body,
          error: errorMessage
        });
      }

      console.error('Create service error:', error);
      res.render('tenant/services/new', {
        title: 'Novo Serviço',
        service: req.body,
        error: error.message || 'Erro ao criar serviço'
      });
    }
  },

  showEditService: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const service = await serviceRepository.findByIdAndTenant(req.params.id, tenantId);

      if (!service) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Serviço não encontrado'
        });
      }

      res.render('tenant/services/edit', {
        title: 'Editar Serviço',
        service
      });
    } catch (error) {
      console.error('Show edit service error:', error);
      res.redirect('/tenant/services');
    }
  },

  updateService: async (req, res) => {
    try {
      const validatedData = updateServiceSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      const service = await serviceRepository.update(req.params.id, tenantId, validatedData);

      if (!service) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Serviço não encontrado'
        });
      }

      // Log update
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'UPDATE',
        'SERVICE',
        service.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/services');
    } catch (error) {
      console.error('Update service error:', error);
      res.render('tenant/services/edit', {
        title: 'Editar Serviço',
        service: await serviceRepository.findByIdAndTenant(req.params.id, req.session.user.tenantId),
        error: error.message || 'Erro ao atualizar serviço'
      });
    }
  },

  deleteService: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;

      await serviceRepository.delete(req.params.id, tenantId);

      // Log deletion
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'DELETE',
        'SERVICE',
        req.params.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/services');
    } catch (error) {
      console.error('Delete service error:', error);
      res.redirect('/tenant/services');
    }
  },

  /**
   * Promotions CRUD
   */
  listPromotions: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const promotions = await promotionRepository.findAllByTenant(tenantId);

      res.render('tenant/promotions/index', {
        title: 'Promoções',
        promotions
      });
    } catch (error) {
      console.error('List promotions error:', error);
      res.render('tenant/promotions/index', {
        title: 'Promoções',
        promotions: [],
        error: 'Erro ao carregar promoções'
      });
    }
  },

  showNewPromotion: (req, res) => {
    res.render('tenant/promotions/new', {
      title: 'Nova Promoção',
      promotion: null,
      error: null
    });
  },

  createPromotion: async (req, res) => {
    try {
      const validatedData = createPromotionSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      validatedData.tenantId = tenantId;

      const promotion = await promotionRepository.create(validatedData);

      // Log creation
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'CREATE',
        'PROMOTION',
        promotion.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/promotions');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.render('tenant/promotions/new', {
          title: 'Nova Promoção',
          promotion: req.body,
          error: errorMessage
        });
      }

      console.error('Create promotion error:', error);
      res.render('tenant/promotions/new', {
        title: 'Nova Promoção',
        promotion: req.body,
        error: error.message || 'Erro ao criar promoção'
      });
    }
  },

  showEditPromotion: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const promotion = await promotionRepository.findByIdAndTenant(req.params.id, tenantId);

      if (!promotion) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Promoção não encontrada'
        });
      }

      res.render('tenant/promotions/edit', {
        title: 'Editar Promoção',
        promotion
      });
    } catch (error) {
      console.error('Show edit promotion error:', error);
      res.redirect('/tenant/promotions');
    }
  },

  updatePromotion: async (req, res) => {
    try {
      const validatedData = updatePromotionSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      const promotion = await promotionRepository.update(req.params.id, tenantId, validatedData);

      if (!promotion) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Promoção não encontrada'
        });
      }

      // Log update
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'UPDATE',
        'PROMOTION',
        promotion.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/promotions');
    } catch (error) {
      console.error('Update promotion error:', error);
      res.render('tenant/promotions/edit', {
        title: 'Editar Promoção',
        promotion: await promotionRepository.findByIdAndTenant(req.params.id, req.session.user.tenantId),
        error: error.message || 'Erro ao atualizar promoção'
      });
    }
  },

  deletePromotion: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;

      await promotionRepository.delete(req.params.id, tenantId);

      // Log deletion
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'DELETE',
        'PROMOTION',
        req.params.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/promotions');
    } catch (error) {
      console.error('Delete promotion error:', error);
      res.redirect('/tenant/promotions');
    }
  },

  /**
   * Tenant Users CRUD
   */
  listUsers: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const users = await userRepository.findAll({ tenantId });

      res.render('tenant/users/index', {
        title: 'Usuários da Loja',
        users
      });
    } catch (error) {
      console.error('List users error:', error);
      res.render('tenant/users/index', {
        title: 'Usuários da Loja',
        users: [],
        error: 'Erro ao carregar usuários'
      });
    }
  },

  showNewUser: (req, res) => {
    res.render('tenant/users/new', {
      title: 'Novo Usuário',
      user: null,
      error: null
    });
  },

  createUser: async (req, res) => {
    try {
      const validatedData = createTenantUserSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      validatedData.tenantId = tenantId;
      validatedData.passwordHash = await hashPassword(validatedData.password);
      delete validatedData.password;

      const user = await userRepository.create(validatedData);

      // Log creation
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'CREATE',
        'USER',
        user.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/users');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.render('tenant/users/new', {
          title: 'Novo Usuário',
          user: req.body,
          error: errorMessage
        });
      }

      console.error('Create user error:', error);
      res.render('tenant/users/new', {
        title: 'Novo Usuário',
        user: req.body,
        error: error.message || 'Erro ao criar usuário'
      });
    }
  },

  showEditUser: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const user = await userRepository.findById(req.params.id);

      if (!user || user.tenantId !== tenantId) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Usuário não encontrado'
        });
      }

      res.render('tenant/users/edit', {
        title: 'Editar Usuário',
        user
      });
    } catch (error) {
      console.error('Show edit user error:', error);
      res.redirect('/tenant/users');
    }
  },

  updateUser: async (req, res) => {
    try {
      const validatedData = updateTenantUserSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      const user = await userRepository.findById(req.params.id);
      if (!user || user.tenantId !== tenantId) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Usuário não encontrado'
        });
      }

      await userRepository.update(req.params.id, validatedData);

      // Log update
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'UPDATE',
        'USER',
        req.params.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/users');
    } catch (error) {
      console.error('Update user error:', error);
      res.render('tenant/users/edit', {
        title: 'Editar Usuário',
        user: await userRepository.findById(req.params.id),
        error: error.message || 'Erro ao atualizar usuário'
      });
    }
  },

  deleteUser: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const user = await userRepository.findById(req.params.id);

      if (!user || user.tenantId !== tenantId) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Usuário não encontrado'
        });
      }

      await userRepository.delete(req.params.id);

      // Log deletion
      await auditLogRepository.logCRUD(
        req.session.user.id,
        tenantId,
        'DELETE',
        'USER',
        req.params.id,
        req.ip || req.connection.remoteAddress
      );

      res.redirect('/tenant/users');
    } catch (error) {
      console.error('Delete user error:', error);
      res.redirect('/tenant/users');
    }
  }
};
