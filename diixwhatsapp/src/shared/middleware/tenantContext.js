/**
 * Tenant Context Middleware - Inject tenant information into request
 * This middleware extracts tenant information from the authenticated user's session
 * and makes it available for downstream middleware and controllers.
 */

/**
 * Extract tenant context from authenticated user session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function tenantContext(req, res, next) {
  // Check if user is authenticated
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Não autenticado'
    });
  }

  const user = req.session.user;
  
  // For MASTER role, tenantId might not exist - this is allowed
  // For TENANT_ADMIN and TENANT_USER roles, tenantId must exist
  if (!user.tenantId && user.role !== 'MASTER') {
    return res.status(403).json({
      success: false,
      error: 'Usuário não pertence a nenhum tenant'
    });
  }

  // Attach tenant context to request
  req.tenantContext = {
    tenantId: user.tenantId,
    tenantName: user.tenantName,
    role: user.role
  };

  // Also attach tenantId directly for backward compatibility
  req.tenantId = user.tenantId;

  next();
}

export default tenantContext;
