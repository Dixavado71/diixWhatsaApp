import { getClientIp } from './rateLimiter.js';

/**
 * Tenant Context Middleware - Inject tenant information into request
 * 
 * Este middleware extrai informações do tenant da sessão do usuário autenticado
 * e as torna disponíveis para middlewares e controllers downstream.
 * 
 * Usa req.auth como padrão, mantendo compatibilidade com req.tenantContext.
 */

/**
 * Extrair contexto do tenant da sessão do usuário autenticado
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function tenantContext(req, res, next) {
  // Verifica se usuário está autenticado
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      error: 'Não autenticado'
    });
  }

  const user = req.session.user;

  // Para role MASTER, tenantId pode não existir - isso é permitido
  // Para roles TENANT_ADMIN e TENANT_USER, tenantId deve existir
  if (!user.tenantId && user.role !== 'MASTER') {
    return res.status(403).json({
      success: false,
      error: 'Usuário não pertence a nenhum tenant'
    });
  }

  // Anexa contexto de autenticação padronizado em req.auth
  req.auth = {
    tenantId: user.tenantId,
    userId: user.id,
    role: user.role,
    ip: getClientIp(req)
  };

  // Também anexa em req.tenantContext para compatibilidade retroativa
  req.tenantContext = {
    tenantId: user.tenantId,
    tenantName: user.tenantName,
    role: user.role
  };

  // Mantém tenantId direto para compatibilidade retroativa
  req.tenantId = user.tenantId;

  next();
}

export default tenantContext;
