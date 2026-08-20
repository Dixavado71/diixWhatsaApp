import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import csurf from 'csurf';
import { config } from './config/env.js';
import { sessionConfig } from './config/session.js';
import authRoutes from './routes/auth.js';
import docsRoutes from './routes/docs.js';
import healthRoutes from './routes/health.js';
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
  // Note: Routes are now under /api/v1/auth/*
  if (req.path.startsWith('/api/') && (req.path.includes('/auth/login') || req.path.includes('/auth/logout'))) {
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
// IMPORTANT: Must call next() after sending response to allow errorHandler to log
app.use((err, req, res, next) => {
  if (err.code === 'EBADCSRFTOKEN') {
    res.status(403).json({ 
      success: false,
      error: 'CSRF token validation failed',
      message: 'Token de segurança inválido. Recarregue a página e tente novamente.'
    });
    return next(err); // Pass error to errorHandler for logging, but response already sent
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
app.get('/', docsRoutes.rootHandler);

// Health check routes
app.use(healthRoutes);

// API Documentation endpoint
app.get('/api-docs', docsRoutes.apiDocsHandler);


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
