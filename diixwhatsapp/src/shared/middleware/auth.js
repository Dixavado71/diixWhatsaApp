import { userRepository } from '../../repositories/userRepository.js';

/**
 * Authentication Middleware - Verify if user is authenticated
 */
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    // Store original URL for redirect after login
    req.session.returnTo = req.originalUrl;
    return res.redirect('/login');
  }

  // Attach user to request for convenience
  req.currentUser = req.session.user;
  next();
}

/**
 * Require Master role
 */
export function requireMaster(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }

  if (req.session.user.role !== 'MASTER') {
    return res.status(403).render('errors/403', {
      title: 'Acesso Negado',
      message: 'Você não tem permissão para acessar esta área.'
    });
  }

  req.currentUser = req.session.user;
  next();
}

/**
 * Require Tenant role (any tenant user)
 */
export function requireTenant(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }

  // Must be a tenant user (not master)
  if (!req.session.user.tenantId) {
    return res.status(403).render('errors/403', {
      title: 'Acesso Negado',
      message: 'Acesso restrito a usuários de loja.'
    });
  }

  req.currentUser = req.session.user;
  next();
}

/**
 * Require Tenant Admin role
 */
export function requireTenantAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.redirect('/login');
  }

  if (!req.session.user.tenantId) {
    return res.status(403).render('errors/403', {
      title: 'Acesso Negado',
      message: 'Acesso restrito a administradores de loja.'
    });
  }

  if (req.session.user.role !== 'TENANT_ADMIN') {
    return res.status(403).render('errors/403', {
      title: 'Acesso Negado',
      message: 'Você não tem permissão para realizar esta operação.'
    });
  }

  req.currentUser = req.session.user;
  next();
}

/**
 * Optional auth - attach user if exists but don't require
 */
export function optionalAuth(req, res, next) {
  if (req.session && req.session.user) {
    req.currentUser = req.session.user;
  }
  next();
}
