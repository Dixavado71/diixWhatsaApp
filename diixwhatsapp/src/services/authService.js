import { userRepository } from '../repositories/userRepository.js';
import { auditLogRepository } from '../repositories/auditLogRepository.js';
import { comparePassword } from '../utils/password.js';
import { appLogger } from '../utils/logger.js';

/**
 * Auth Service - Business logic for authentication
 */
export const authService = {
  /**
   * Authenticate a user
   * @param {string} username - Username
   * @param {string} password - Plain text password
   * @param {string} ip - User IP address
   * @param {string} userAgent - User agent string
   */
  async authenticate(username, password, ip, userAgent) {
    // Find user by username
    const user = await userRepository.findByUsername(username);

    if (!user) {
      appLogger.auth.failed(username, 'USER_NOT_FOUND', ip);
      return { success: false, error: 'Usuário ou senha inválidos' };
    }

    // Check if user is active
    if (!user.active) {
      appLogger.auth.failed(username, 'USER_INACTIVE', ip);
      return { success: false, error: 'Usuário está inativo' };
    }

    // Check if tenant is active (for tenant users)
    if (user.tenantId && user.tenant && !user.tenant.active) {
      appLogger.auth.failed(username, 'TENANT_INACTIVE', ip);
      return { success: false, error: 'Loja está inativa' };
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.passwordHash);

    if (!isValidPassword) {
      appLogger.auth.failed(username, 'INVALID_PASSWORD', ip);
      return { success: false, error: 'Usuário ou senha inválidos' };
    }

    // Update last login timestamp
    await userRepository.updateLastLogin(user.id);

    // Log successful login
    await auditLogRepository.logAuth(user.id, 'LOGIN', ip, userAgent);
    appLogger.auth.login(username, true, ip);

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
      appLogger.auth.logout(user.username, ip);
    }
  }
};
