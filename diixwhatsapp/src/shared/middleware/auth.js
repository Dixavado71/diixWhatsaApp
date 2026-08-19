import { userRepository } from '../../repositories/userRepository.js';

/**
 * Authentication Middleware - Verify if user is authenticated (API ONLY)
 */
export function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado. Faça login para acessar este recurso.'
    });
  }

  // Attach user to request for convenience
  req.currentUser = req.session.user;
  next();
}

/**
 * Require Master role (API ONLY)
 */
export function requireMaster(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado. Faça login para acessar este recurso.'
    });
  }

  if (req.session.user.role !== 'MASTER') {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Permissão de MASTER necessária.'
    });
  }

  req.currentUser = req.session.user;
  next();
}

/**
 * Require Tenant role (any tenant user) (API ONLY)
 */
export function requireTenant(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado. Faça login para acessar este recurso.'
    });
  }

  // Must be a tenant user (not master)
  if (!req.session.user.tenantId) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Esta rota é restrita a usuários de loja (Tenant).'
    });
  }

  req.currentUser = req.session.user;
  next();
}

/**
 * Require Tenant Admin role (API ONLY)
 */
export function requireTenantAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Não autorizado. Faça login para acessar este recurso.'
    });
  }

  if (!req.session.user.tenantId) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Esta rota é restrita a usuários de loja.'
    });
  }

  if (req.session.user.role !== 'TENANT_ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado. Permissão de TENANT_ADMIN necessária.'
    });
  }

  req.currentUser = req.session.user;
  next();
}

/**
 * Optional auth - attach user if exists but don't require (API ONLY)
 */
export function optionalAuth(req, res, next) {
  if (req.session && req.session.user) {
    req.currentUser = req.session.user;
  }
  next();
}