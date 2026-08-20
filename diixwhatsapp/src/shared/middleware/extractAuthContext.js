/**
 * Extract Auth Context Middleware
 * 
 * Middleware dedicado para extrair contexto de autenticação da sessão
 * e injetá-lo em req.auth para uso nos controllers.
 * 
 * Princípio: Controllers não devem acessar req.session diretamente.
 * Este middleware segue o padrão de Inversão de Dependência, onde
 * o contexto é injetado ao invés de ser acessado diretamente.
 * 
 * @typedef {Object} AuthContext
 * @property {string} tenantId - ID do tenant
 * @property {string} userId - ID do usuário autenticado
 * @property {string} role - Papel do usuário (MASTER, TENANT_ADMIN, TENANT_USER)
 * @property {string} ip - IP da requisição
 */

import { getClientIp } from '../controllers/baseController.js';

/**
 * Extrai contexto de autenticação e injeta em req.auth
 * 
 * Deve ser usado APÓS middlewares de autenticação (requireAuth, requireTenant, etc.)
 * e ANTES dos handlers do controller.
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

    req.auth = {
      tenantId: req.session.user.tenantId,
      userId: req.session.user.id,
      role: req.session.user.role,
      ip: getClientIp(req)
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Versão simplificada que apenas verifica autenticação sem lançar erro
 * Útil para rotas que podem ser acessadas por usuários autenticados ou não
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
export function optionalAuthContext(req, res, next) {
  try {
    if (req.session && req.session.user) {
      req.auth = {
        tenantId: req.session.user.tenantId,
        userId: req.session.user.id,
        role: req.session.user.role,
        ip: getClientIp(req)
      };
    } else {
      req.auth = null;
    }

    next();
  } catch (error) {
    next(error);
  }
}

export default {
  extractAuthContext,
  optionalAuthContext
};
