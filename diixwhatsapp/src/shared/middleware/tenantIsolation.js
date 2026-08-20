/**
 * Tenant Isolation Middleware - Ensure tenant can only access their own data
 * MASTER role bypasses all tenant isolation checks
 */

/**
 * Inject tenantId into request and validate it exists
 * This middleware should be used after authentication for tenant users
 * MASTER role bypasses tenant validation
 */
export function injectTenantId(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Não autenticado'
    });
  }

  const { tenantId, role } = req.session.user;

  // MASTER role bypasses tenant isolation
  if (role === 'MASTER') {
    req.tenantId = null;
    req.isMaster = true;
    return next();
  }

  // For non-MASTER roles, tenantId must exist
  if (!tenantId) {
    return res.status(403).json({
      success: false,
      error: 'Usuário não pertence a nenhum tenant'
    });
  }

  // Attach tenantId to request for use in controllers/repositories
  req.tenantId = tenantId;
  req.isMaster = false;
  next();
}

/**
 * Tenant Isolation Middleware for User Management
 * - MASTER: Can manage all users across all tenants (no filtering)
 * - TENANT_ADMIN: Can manage only users within their own tenantId
 */
export function tenantIsolation(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Não autenticado'
    });
  }

  const { tenantId, role } = req.session.user;

  // MASTER role bypasses tenant isolation - can access all tenants
  if (role === 'MASTER') {
    req.queryFilter = {}; // No tenant filtering for MASTER
    req.canAccessAllTenants = true;
    return next();
  }

  // TENANT_ADMIN and TENANT_USER can only access their own tenant
  if (!tenantId) {
    return res.status(403).json({
      success: false,
      error: 'Acesso negado: tenant não identificado'
    });
  }

  // Attach tenant filter for downstream controllers/repositories
  req.queryFilter = { tenantId };
  req.canAccessAllTenants = false;

  next();
}

/**
 * Validate that the requested resource belongs to the authenticated tenant
 * @param {string} resourceIdParam - Name of the URL parameter containing resource ID
 * @param {Function} repository - Repository with findByIdAndTenant method
 */
export function validateTenantOwnership(resourceIdParam, repository) {
  return async (req, res, next) => {
    if (!req.session || !req.session.user || !req.session.user.tenantId) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado: tenant não identificado'
      });
    }

    const resourceId = req.params[resourceIdParam];
    const tenantId = req.session.user.tenantId;

    if (!resourceId) {
      return res.status(400).json({
        success: false,
        error: 'ID do recurso não fornecido'
      });
    }

    try {
      // Check if resource exists and belongs to this tenant
      const resource = await repository.findByIdAndTenant(resourceId, tenantId);
      
      if (!resource) {
        // Return 404 to avoid leaking information about existence in other tenants
        return res.status(404).json({
          success: false,
          error: 'Recurso não encontrado'
        });
      }

      // Attach resource to request for use in controller
      req.resource = resource;
      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: 'Erro ao validar acesso ao recurso'
      });
    }
  };
}

/**
 * Force tenant context - Ensure user is a tenant user (not MASTER)
 */
export function requireTenantContext(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Não autenticado'
    });
  }

  if (!req.session.user.tenantId) {
    return res.status(403).json({
      success: false,
      error: 'Acesso restrito a usuários de tenant'
    });
  }

  next();
}

export default { 
  injectTenantId, 
  tenantIsolation,
  validateTenantOwnership, 
  requireTenantContext 
};
