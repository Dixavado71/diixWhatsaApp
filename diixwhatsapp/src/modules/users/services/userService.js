/**
 * User Service - Business logic layer for User operations
 * Responsibilities:
 * - Handle business rules
 * - Hash passwords
 * - Manage audit logging
 * - Interact with userRepository
 */
import { userRepository } from '../repositories/userRepository.js';
import { auditLogRepository } from '../../../repositories/auditLogRepository.js';
import { hashPassword } from '../../../shared/helpers/password.js';

export const userService = {
  /**
   * Get all users with optional filters
   */
  async getAllUsers(options = {}) {
    return userRepository.findAll(options);
  },

  /**
   * Get user by ID
   */
  async getUserById(id) {
    return userRepository.findById(id);
  },

  /**
   * Get user by username
   */
  async getUserByUsername(username) {
    return userRepository.findByUsername(username);
  },

  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    return userRepository.findByEmail(email);
  },

  /**
   * Create new user
   */
  async createUser(userData, adminUserId, ip) {
    // 1. Hash password
    const hashedPassword = await hashPassword(userData.password);
    const userDataToCreate = {
      ...userData,
      passwordHash: hashedPassword,
      password: undefined // Remove plain text password from payload
    };

    // 2. Create in database
    const user = await userRepository.create(userDataToCreate);

    // 3. Audit Log (Centralizado no Service)
    await auditLogRepository.logCRUD(
      adminUserId,
      user.tenantId || null, // Pode ser null se for usuário MASTER
      'CREATE',
      'USER',
      user.id,
      ip
    );

    return user;
  },

  /**
   * Update user
   */
  async updateUser(id, userData, adminUserId, ip) {
    // 1. Handle password update if a new one is provided
    if (userData.password) {
      userData.passwordHash = await hashPassword(userData.password);
      delete userData.password; // Clean up plain text password
    }

    // 2. Update in database
    const updatedUser = await userRepository.update(id, userData);

    // 3. Audit Log
    await auditLogRepository.logCRUD(
      adminUserId,
      updatedUser.tenantId || null,
      'UPDATE',
      'USER',
      id,
      ip
    );

    return updatedUser;
  },

  /**
   * Delete user
   */
  async deleteUser(id, adminUserId, ip) {
    // 1. Fetch user first to get tenantId for audit log and ensure it exists
    const user = await userRepository.findById(id);
    
    if (!user) {
      // Deixa o Prisma lançar o erro P2025, ou lança um erro customizado
      // que será capturado pelo nosso errorHandler global
      throw new Error('Usuário não encontrado');
    }

    // 2. Delete from database
    await userRepository.delete(id);

    // 3. Audit Log
    await auditLogRepository.logCRUD(
      adminUserId,
      user.tenantId || null,
      'DELETE',
      'USER',
      id,
      ip
    );

    return true;
  },

  /**
   * Check if username exists (excluding a specific user)
   */
  async checkUsernameExists(username, excludeId = null) {
    return userRepository.usernameExists(username, excludeId);
  },

  /**
   * Check if email exists (excluding a specific user)
   */
  async checkEmailExists(email, excludeId = null) {
    return userRepository.emailExists(email, excludeId);
  },

  /**
   * Toggle user active status
   */
  async toggleUserActive(id, adminUserId, ip) {
    const user = await userRepository.findById(id);
    if (!user) throw new Error('Usuário não encontrado');

    const updatedUser = await userRepository.toggleActive(id);

    // Audit Log for status change
    await auditLogRepository.logCRUD(
      adminUserId,
      user.tenantId || null,
      updatedUser.active ? 'ACTIVATE' : 'DEACTIVATE',
      'USER',
      id,
      ip
    );

    return updatedUser;
  },

  /**
   * Count users
   */
  async countUsers(filters = {}) {
    return userRepository.count(filters);
  }
};