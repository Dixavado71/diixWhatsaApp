/**
 * Tenant Isolation Middleware - Ensure tenant can only access their own data
 */

/**
 * Inject tenantId into request and validate it exists
 * This middleware should be used after authentication for tenant users
 */
export function injectTenantId(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Não autenticado'
    });
  }

  const { tenantId } = req.session.user;

  // For MASTER role, tenantId might not exist
  if (!tenantId && req.session.user.role !== 'MASTER') {
    return res.status(403).json({
      success: false,
      error: 'Usuário não pertence a nenhum tenant'
    });
  }

  // Attach tenantId to request for use in controllers/repositories
  req.tenantId = tenantId;
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
  validateTenantOwnership, 
  requireTenantContext 
};
