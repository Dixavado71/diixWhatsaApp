import { userRepository } from '../repositories/userRepository.js';
import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { comparePassword } from '../shared/helpers/password.js';
import { logger } from '../infrastructure/database/prismaClient.js';

/**
 * Auth Service - Business logic for authentication
 */
export const authService = {
  /**
   * Authenticate a user
   * @param {string} identifier - Username or email
   * @param {string} password - Plain text password
   * @param {string} ip - User IP address
   * @param {string} userAgent - User agent string
   */
  async authenticate(identifier, password, ip, userAgent) {
    // Try to find user by username first, then by email
    let user = await userRepository.findByUsername(identifier);
    
    if (!user) {
      // If not found by username, try email
      user = await userRepository.findByEmail(identifier);
    }

    if (!user) {
      logger.auth.failed(identifier, 'USER_NOT_FOUND', ip);
      return { success: false, error: 'Usuário ou senha inválidos' };
    }

    // Check if user is active
    if (!user.active) {
      logger.auth.failed(identifier, 'USER_INACTIVE', ip);
      return { success: false, error: 'Usuário está inativo' };
    }

    // Check if tenant is active (for tenant users)
    if (user.tenantId && user.tenant && !user.tenant.active) {
      logger.auth.failed(identifier, 'TENANT_INACTIVE', ip);
      return { success: false, error: 'Loja está inativa' };
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      logger.auth.failed(identifier, 'INVALID_PASSWORD', ip);
      return { success: false, error: 'Usuário ou senha inválidos' };
    }

    // Update last login timestamp
    await userRepository.updateLastLogin(user.id);

    // Log successful login
    await auditLogRepository.logAuth(user.id, 'LOGIN', ip, userAgent);
    logger.auth.login(identifier, true, ip);

    // Return user data without sensitive information
    return {
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenant ? {
          id: user.tenant.id,
          name: user.tenant.name,
          slug: user.tenant.slug
        } : null
      }
    };
  },

  /**
   * Logout user
   * @param {string} userId - User ID
   * @param {string} ip - User IP address
   * @param {string} userAgent - User agent string
   */
  async logout(userId, ip, userAgent) {
    const user = await userRepository.findById(userId);
    if (user) {
      await auditLogRepository.logAuth(userId, 'LOGOUT', ip, userAgent);
      logger.auth.logout(user.username, ip);
    }
  }
};
