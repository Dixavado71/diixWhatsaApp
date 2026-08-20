import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import csurf from 'csurf';
import { config } from './config/env.js';
import { sessionConfig } from './config/session.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './modules/admin/routes/adminRoutes.js';
import clientRoutes from './modules/clients/routes/clientRoutes.js';
import serviceRoutes from './modules/services/routes/serviceRoutes.js';
import promotionRoutes from './modules/promotions/routes/promotionRoutes.js';
import tenantRoutes from './modules/tenants/routes/tenantRoutes.js';
import productRoutes from './modules/products/routes/productRoutes.js';
import userRoutes from './modules/users/routes/userRoutes.js';
import { asyncHandler, errorHandler, notFoundHandler } from './shared/middleware/errorHandler.js';
import { optionalAuth } from './shared/middleware/auth.js';
import { generalLimiter } from './shared/middleware/rateLimiter.js';
import { prisma, logger } from './infrastructure/database/prismaClient.js';
import { getRedisClient, checkRedisHealth } from './infrastructure/cache/redisClient.js';

const app = express();

// ============================================================================
// API Versioning - All routes mounted under /api/v1/
// This allows for future API evolution without breaking changes
// ============================================================================
const apiRouter = express.Router();
const API_VERSION = 'v1';

// CORS Configuration
const corsOptions = {
  origin: config.frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
};
app.use(cors(corsOptions));

// Security headers
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Trust proxy for proper IP detection behind reverse proxies
app.set('trust proxy', 1);

// Static files (if needed for documentation)
app.use(express.static('public'));

// Body parsing - must be before csurf
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session - MUST be before csurf as csurf uses session to store token
app.use(sessionConfig);

// Rate limiting
app.use(generalLimiter);

// CSRF Protection using csurf package
// SECURITY: Replaces custom insecure implementation with battle-tested library
// Configured for API usage (returns JSON errors instead of HTML)
const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.nodeEnv === 'production'
  }
});

// Apply CSRF protection to all routes except GET, OPTIONS, and login endpoints
app.use((req, res, next) => {
  // Skip CSRF for safe methods (GET, HEAD, OPTIONS)
  if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'OPTIONS') {
    return next();
  }
  
  // Skip CSRF for login/logout endpoints (no valid session yet)
  if (req.path === '/login' || req.path === '/logout') {
    return next();
  }
  
  // Skip if no session (will fail gracefully for unauthenticated requests)
  if (!req.session) {
    return next();
  }
  
  // Apply CSRF token validation for state-changing requests
  csrfProtection(req, res, next);
});

// Handle CSRF errors with JSON response (API-friendly)
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ 
      error: 'CSRF token validation failed',
      message: 'Token de segurança inválido. Recarregue a página e tente novamente.'
    });
  }
  next(err);
});

// Make CSRF token available in response headers for API clients
// This allows frontend to read the token and include it in subsequent requests
app.use((req, res, next) => {
  if (req.csrfToken) {
    const token = req.csrfToken();
    res.setHeader('X-CSRF-Token', token);
    // Also make available for forms that might need it
    if (req.session) {
      req.session.csrfToken = token;
    }
  }
  next();
});

// Auth middleware
app.use(optionalAuth);

// Routes - Root endpoint now returns API info
app.get('/', (req, res) => {
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
});

// Health check - Advanced check for Database and Redis
// Returns 200 if all services healthy, 503 if any fail
app.get("/health", async (req, res) => {
  const healthStatus = {
    status: "ok",
    service: "DiixWhatsApp",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    environment: config.nodeEnv,
    checks: {}
  };
  
  let allHealthy = true;
  
  // Check Database using singleton Prisma client
  try {
    await prisma.$queryRaw`SELECT 1 as connected`;
    healthStatus.checks.database = { status: "healthy" };
  } catch (error) {
    healthStatus.checks.database = { 
      status: "unhealthy", 
      error: error.message 
    };
    allHealthy = false;
    logger.error("Health check DB failed", { error: error.message });
  }
  
  // Check Redis connection via session store client
  try {
    const redisHealthy = await checkRedisHealth();
    healthStatus.checks.redis = { 
      status: redisHealthy ? "healthy" : "unhealthy"
    };
    if (!redisHealthy) {
      allHealthy = false;
    }
  } catch (error) {
    healthStatus.checks.redis = { 
      status: "unhealthy", 
      error: error.message 
    };
    allHealthy = false;
    logger.error("Health check Redis failed", { error: error.message });
  }
  
  // Return appropriate status code
  const statusCode = allHealthy ? 200 : 503;
  res.status(statusCode).json(healthStatus);
});

/**
 * Database-only Health Check
 * Uses the singleton Prisma client for stable verification
 */
app.get("/health/db", async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1 as connected`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    logger.error("Health check DB failed", { error: error.message });
    res.status(500).json({ 
      status: "error", 
      database: "disconnected", 
      error: error.message 
    });
  }
});

// API Documentation endpoint
app.get('/api-docs', (req, res) => {
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
});


// ============================================================================
// API Routes - Mounted under /api/v1/ prefix for versioning
// ============================================================================

// Auth routes (public)
apiRouter.use('/auth', authRoutes);

// Admin routes (requires MASTER role)
apiRouter.use('/admin', adminRoutes);

// Tenant routes (main tenant dashboard routes - requires TENANT role)
apiRouter.use('/tenant', tenantRoutes);

// Products module routes (modularized)
apiRouter.use('/tenant/products', productRoutes);

// Clients module routes (modularized)
apiRouter.use('/tenant/clients', clientRoutes);

// Services module routes (modularized)
apiRouter.use('/tenant/services', serviceRoutes);

// Promotions module routes (modularized)
apiRouter.use('/tenant/promotions', promotionRoutes);

// Users module routes (modularized) - Admin only for user management
apiRouter.use('/admin/users', userRoutes);

// Mount all API routes under /api/v1/
app.use(`/api/${API_VERSION}`, apiRouter);

// ============================================================================
// Error Handling - Must be last
// ============================================================================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
