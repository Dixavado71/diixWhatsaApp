import { getClientIp } from './rateLimiter.js';

/**
 * Extract Auth Context Middleware
 * 
 * Extrai informações de autenticação da sessão e injeta em req.auth
 * para uso pelos controllers. Isso remove a dependência direta de
 * req.session dos controllers, seguindo o princípio de Inversão de Dependência.
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function extractAuthContext(req, res, next) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'Não autenticado'
      });
    }

    const user = req.session.user;

    // Extrai contexto de autenticação padronizado
    req.auth = {
      tenantId: user.tenantId,
      userId: user.id,
      role: user.role,
      ip: getClientIp(req)
    };

    next();
  } catch (error) {
    next(error);
  }
}

export default extractAuthContext;
