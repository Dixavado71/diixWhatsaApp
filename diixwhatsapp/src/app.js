import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import crypto from 'crypto';
import helmet from 'helmet';
import { config } from './config/env.js';
import { sessionConfig } from './config/session.js';
import authRoutes from './routes/auth.js';
import adminRoutes from './routes/admin.js';
import tenantRoutes from './routes/tenant.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { optionalAuth } from './middleware/auth.js';
import { generalLimiter } from './middleware/rateLimiter.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Security headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable for EJS compatibility
  crossOriginEmbedderPolicy: false
}));

// Trust proxy for proper IP detection behind reverse proxies
app.set('trust proxy', 1);

// View engine setup with custom settings for EJS includes
app.set('view engine', 'ejs');
const viewsPath = path.join(__dirname, '../views');
app.set('views', viewsPath);

// Custom EJS configuration to support relative includes from views directory
import('ejs').then(ejsModule => {
  app.engine('ejs', (filePath, options, callback) => {
    options.root = viewsPath;
    // ejsModule.default is the actual EJS module when imported as ESM
    const ejs = ejsModule.default || ejsModule;
    ejs.renderFile(filePath, options, callback);
  });
}).catch(err => {
  console.error('Failed to load EJS:', err);
});

// Static files
app.use(express.static(path.join(__dirname, '../public')));

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session
app.use(sessionConfig);

// Rate limiting
app.use(generalLimiter);

// CSRF protection (exclude login routes)
// Note: csurf is deprecated, implementing basic CSRF token validation manually
const csrfProtection = (req, res, next) => {
  // Skip CSRF for GET requests and login pages
  if (req.method === 'GET' || 
      req.path === '/login' || 
      req.path === '/admin/login' || 
      req.path === '/tenant/login') {
    return next();
  }
  
  // Generate CSRF token if not present
  if (!req.session.csrfToken) {
    req.session.csrfToken = crypto.randomBytes(32).toString('hex');
  }
  
  // Make token available to views
  res.locals.csrfToken = req.session.csrfToken;
  
  // Validate CSRF token on state-changing requests
  const token = req.body._csrf || req.headers['x-csrf-token'];
  if (token && token !== req.session.csrfToken) {
    return res.status(403).json({ error: 'CSRF token validation failed' });
  }
  
  next();
};

app.use(csrfProtection);

// Make CSRF token available to all views
app.use((req, res, next) => {
  res.locals.csrfToken = req.session.csrfToken || '';
  next();
});

// Make user available to all views
app.use(optionalAuth);

// Flash messages helper
app.use((req, res, next) => {
  res.locals.success = req.session.success || null;
  res.locals.error = req.session.error || null;
  res.locals.user = req.session.user || null;
  
  // Clear flash messages after reading
  delete req.session.success;
  delete req.session.error;
  
  next();
});

// Routes
app.get('/', (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect(req.session.user.role === 'MASTER' ? '/admin/dashboard' : '/tenant/dashboard');
  }
  res.redirect('/login');
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'DiixWhatsApp' });
});

app.get('/health/db', async (req, res) => {
  try {
    const { prisma } = await import('./config/database.js');
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected', error: error.message });
  }
});

// Auth routes
app.use(authRoutes);

// Admin routes
app.use('/admin', adminRoutes);

// Tenant routes
app.use('/tenant', tenantRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
