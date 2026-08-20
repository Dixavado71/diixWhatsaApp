import { config } from '../config/env.js';

/**
 * API Documentation endpoint
 * Returns comprehensive API documentation with all endpoints, models, and error codes
 */
export const apiDocsHandler = (req, res) => {
  res.json({
    api: {
      name: 'DiixWhatsApp API',
      version: '1.0.0',
      description: 'Multi-tenant WhatsApp business management backend API',
      baseUrl: config.apiUrl,
      authentication: {
        type: 'Session-based',
        description: 'Use POST /login with username and password to obtain a session cookie. Include the session cookie in subsequent requests.',
        csrf: 'Include X-CSRF-Token header or _csrf field in state-changing requests'
      },
      endpoints: {
        public: {
          'GET /': {
            description: 'Get API information and available endpoints',
            response: 'JSON object with service info and endpoint list'
          },
          'GET /health': {
            description: 'Health check endpoint',
            response: '{ status: "ok", service: "DiixWhatsApp" }'
          },
          'GET /health/db': {
            description: 'Database connection health check',
            response: '{ status: "ok", database: "connected" } ou objeto de erro'
          },
          'GET /login': {
            description: 'Show login page (for browser clients)',
            response: 'Login form or redirect if already authenticated'
          },
          'POST /login': {
            description: 'Authenticate user and create session',
            body: '{ username: string, password: string }',
            response: 'Redirect to dashboard on success, error message on failure'
          },
          'POST /logout': {
            description: 'Destroy user session',
            requiresAuth: true,
            response: 'Redirect to /login'
          }
        },
        admin: {
          description: 'Admin endpoints require MASTER role authentication',
          'GET /admin/dashboard': {
            description: 'Get admin dashboard statistics',
            requiresAuth: true,
            requiresRole: 'MASTER',
            response: 'Dashboard stats and recent tenants data'
          },
          'GET /admin/tenants': {
            description: 'List all tenants',
            requiresAuth: true,
            requiresRole: 'MASTER',
            response: 'Array of tenant objects'
          },
          'POST /admin/tenants': {
            description: 'Create new tenant',
            requiresAuth: true,
            requiresRole: 'MASTER',
            body: '{ name: string, document: string, email: string, phone: string, active: boolean }',
            response: 'Redirect to /admin/tenants on success'
          },
          'POST /admin/tenants/:id': {
            description: 'Update tenant by ID',
            requiresAuth: true,
            requiresRole: 'MASTER',
            body: '{ name: string, document: string, email: string, phone: string, active: boolean }',
            response: 'Redirect to /admin/tenants on success'
          },
          'POST /admin/tenants/:id/toggle': {
            description: 'Toggle tenant active status',
            requiresAuth: true,
            requiresRole: 'MASTER',
            response: 'Redirect to /admin/tenants'
          },
          'POST /admin/tenants/:id/delete': {
            description: 'Delete tenant by ID',
            requiresAuth: true,
            requiresRole: 'MASTER',
            response: 'Redirect to /admin/tenants'
          },
          'GET /admin/users': {
            description: 'List all users',
            requiresAuth: true,
            requiresRole: 'MASTER',
            response: 'Array of user objects'
          },
          'POST /admin/users': {
            description: 'Create new user',
            requiresAuth: true,
            requiresRole: 'MASTER',
            body: '{ username: string, password: string, email: string, role: string, tenantId: string }',
            response: 'Redirect to /admin/users on success'
          },
          'POST /admin/users/:id': {
            description: 'Update user by ID',
            requiresAuth: true,
            requiresRole: 'MASTER',
            body: '{ username: string, email: string, role: string, tenantId: string }',
            response: 'Redirect to /admin/users on success'
          },
          'POST /admin/users/:id/delete': {
            description: 'Delete user by ID',
            requiresAuth: true,
            requiresRole: 'MASTER',
            response: 'Redirect to /admin/users'
          }
        },
        tenant: {
          description: 'Tenant endpoints require TENANT role authentication',
          'GET /tenant/dashboard': {
            description: 'Get tenant dashboard statistics',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Dashboard stats with counts and recent items'
          },
          'GET /tenant/products': {
            description: 'List all products for current tenant',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Array of product objects'
          },
          'POST /tenant/products': {
            description: 'Create new product',
            requiresAuth: true,
            requiresRole: 'TENANT',
            body: '{ name: string, description: string, price: number, slug: string }',
            response: 'Redirect to /tenant/products on success'
          },
          'POST /tenant/products/:id': {
            description: 'Update product by ID',
            requiresAuth: true,
            requiresRole: 'TENANT',
            body: '{ name: string, description: string, price: number, slug: string }',
            response: 'Redirect to /tenant/products on success'
          },
          'POST /tenant/products/:id/delete': {
            description: 'Delete product by ID',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Redirect to /tenant/products'
          },
          'GET /tenant/clients': {
            description: 'List all clients for current tenant',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Array of client objects'
          },
          'POST /tenant/clients': {
            description: 'Create new client',
            requiresAuth: true,
            requiresRole: 'TENANT',
            body: '{ name: string, email: string, phone: string, document: string }',
            response: 'Redirect to /tenant/clients on success'
          },
          'POST /tenant/clients/:id': {
            description: 'Update client by ID',
            requiresAuth: true,
            requiresRole: 'TENANT',
            body: '{ name: string, email: string, phone: string, document: string }',
            response: 'Redirect to /tenant/clients on success'
          },
          'POST /tenant/clients/:id/delete': {
            description: 'Delete client by ID',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Redirect to /tenant/clients'
          },
          'GET /tenant/services': {
            description: 'List all services for current tenant',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Array of service objects'
          },
          'POST /tenant/services': {
            description: 'Create new service',
            requiresAuth: true,
            requiresRole: 'TENANT',
            body: '{ name: string, description: string, price: number, duration: number }',
            response: 'Redirect to /tenant/services on success'
          },
          'POST /tenant/services/:id': {
            description: 'Update service by ID',
            requiresAuth: true,
            requiresRole: 'TENANT',
            body: '{ name: string, description: string, price: number, duration: number }',
            response: 'Redirect to /tenant/services on success'
          },
          'POST /tenant/services/:id/delete': {
            description: 'Delete service by ID',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Redirect to /tenant/services'
          },
          'GET /tenant/promotions': {
            description: 'List all promotions for current tenant',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Array of promotion objects'
          },
          'POST /tenant/promotions': {
            description: 'Create new promotion',
            requiresAuth: true,
            requiresRole: 'TENANT',
            body: '{ title: string, description: string, discount: number, startDate: Date, endDate: Date }',
            response: 'Redirect to /tenant/promotions on success'
          },
          'POST /tenant/promotions/:id': {
            description: 'Update promotion by ID',
            requiresAuth: true,
            requiresRole: 'TENANT',
            body: '{ title: string, description: string, discount: number, startDate: Date, endDate: Date }',
            response: 'Redirect to /tenant/promotions on success'
          },
          'POST /tenant/promotions/:id/delete': {
            description: 'Delete promotion by ID',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Redirect to /tenant/promotions'
          },
          'GET /tenant/users': {
            description: 'List all users for current tenant',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Array of user objects'
          },
          'POST /tenant/users': {
            description: 'Create new user for current tenant',
            requiresAuth: true,
            requiresRole: 'TENANT',
            body: '{ username: string, password: string, email: string, role: string }',
            response: 'Redirect to /tenant/users on success'
          },
          'POST /tenant/users/:id': {
            description: 'Update user by ID',
            requiresAuth: true,
            requiresRole: 'TENANT',
            body: '{ username: string, email: string, role: string }',
            response: 'Redirect to /tenant/users on success'
          },
          'POST /tenant/users/:id/delete': {
            description: 'Delete user by ID',
            requiresAuth: true,
            requiresRole: 'TENANT',
            response: 'Redirect to /tenant/users'
          }
        }
      },
      models: {
        Tenant: {
          id: 'string (UUID)',
          name: 'string',
          document: 'string (CNPJ)',
          email: 'string',
          phone: 'string',
          active: 'boolean',
          createdAt: 'DateTime',
          updatedAt: 'DateTime'
        },
        User: {
          id: 'string (UUID)',
          username: 'string (unique)',
          passwordHash: 'string',
          email: 'string',
          role: 'enum (MASTER, TENANT_ADMIN, TENANT_USER)',
          tenantId: 'string (UUID, nullable for MASTER)',
          createdAt: 'DateTime',
          updatedAt: 'DateTime'
        },
        Product: {
          id: 'string (UUID)',
          tenantId: 'string (UUID)',
          name: 'string',
          description: 'string',
          price: 'Decimal',
          slug: 'string',
          createdAt: 'DateTime',
          updatedAt: 'DateTime'
        },
        Client: {
          id: 'string (UUID)',
          tenantId: 'string (UUID)',
          name: 'string',
          email: 'string',
          phone: 'string',
          document: 'string (CPF/CNPJ)',
          createdAt: 'DateTime',
          updatedAt: 'DateTime'
        },
        Service: {
          id: 'string (UUID)',
          tenantId: 'string (UUID)',
          name: 'string',
          description: 'string',
          price: 'Decimal',
          duration: 'integer (minutes)',
          createdAt: 'DateTime',
          updatedAt: 'DateTime'
        },
        Promotion: {
          id: 'string (UUID)',
          tenantId: 'string (UUID)',
          title: 'string',
          description: 'string',
          discount: 'Decimal',
          startDate: 'DateTime',
          endDate: 'DateTime',
          createdAt: 'DateTime',
          updatedAt: 'DateTime'
        }
      },
      errorHandling: {
        '400': 'Bad Request - Invalid input data',
        '401': 'Unauthorized - Authentication required',
        '403': 'Forbidden - Insufficient permissions or CSRF validation failed',
        '404': 'Not Found - Resource does not exist',
        '500': 'Internal Server Error'
      }
    }
  });
};

/**
 * Root endpoint handler - Returns API info and available endpoints
 */
export const rootHandler = (req, res) => {
  res.json({
    service: 'DiixWhatsApp API',
    version: '1.0.0',
    description: 'Backend API for multi-tenant WhatsApp business management',
    endpoints: {
      health: 'GET /health',
      healthDb: 'GET /health/db',
      apiDocs: 'GET /api-docs',
      auth: {
        login: 'POST /login',
        logout: 'POST /logout',
        showLogin: 'GET /login'
      },
      admin: {
        dashboard: 'GET /admin/dashboard',
        tenants: 'GET /admin/tenants',
        createTenant: 'POST /admin/tenants',
        updateTenant: 'POST /admin/tenants/:id',
        deleteTenant: 'POST /admin/tenants/:id/delete',
        toggleTenant: 'POST /admin/tenants/:id/toggle',
        users: 'GET /admin/users',
        createUser: 'POST /admin/users',
        updateUser: 'POST /admin/users/:id',
        deleteUser: 'POST /admin/users/:id/delete'
      },
      tenant: {
        dashboard: 'GET /tenant/dashboard',
        products: 'GET /tenant/products',
        createProduct: 'POST /tenant/products',
        updateProduct: 'POST /tenant/products/:id',
        deleteProduct: 'POST /tenant/products/:id/delete',
        clients: 'GET /tenant/clients',
        createClient: 'POST /tenant/clients',
        updateClient: 'POST /tenant/clients/:id',
        deleteClient: 'POST /tenant/clients/:id/delete',
        services: 'GET /tenant/services',
        createService: 'POST /tenant/services',
        updateService: 'POST /tenant/services/:id',
        deleteService: 'POST /tenant/services/:id/delete',
        promotions: 'GET /tenant/promotions',
        createPromotion: 'POST /tenant/promotions',
        updatePromotion: 'POST /tenant/promotions/:id',
        deletePromotion: 'POST /tenant/promotions/:id/delete',
        users: 'GET /tenant/users',
        createUser: 'POST /tenant/users',
        updateUser: 'POST /tenant/users/:id',
        deleteUser: 'POST /tenant/users/:id/delete'
      }
    }
  });
};
