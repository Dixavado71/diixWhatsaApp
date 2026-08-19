/**
 * User Service - Business logic layer for User operations
 */
import { userRepository } from '../repositories/userRepository.js';
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
    // Hash password
    const hashedPassword = await hashPassword(userData.password);
    const userDataToCreate = {
      ...userData,
      passwordHash: hashedPassword,
      password: undefined
    };

    const user = await userRepository.create(userDataToCreate);

    return user;
  },

  /**
   * Update user
   */
  async updateUser(id, userData, adminUserId, ip) {
    const updatedUser = await userRepository.update(id, userData);
    return updatedUser;
  },

  /**
   * Delete user
   */
  async deleteUser(id) {
    return userRepository.delete(id);
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
  async toggleUserActive(id) {
    return userRepository.toggleActive(id);
  },

  /**
   * Count users
   */
  async countUsers(filters = {}) {
    return userRepository.count(filters);
  }
};

