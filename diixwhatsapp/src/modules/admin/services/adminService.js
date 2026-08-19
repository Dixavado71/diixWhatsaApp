/**
 * Admin Service - Business logic layer for admin operations
 * Orchestrates calls to other domain modules through their public APIs
 */
import { tenantService } from '../tenants/services/tenantService.js';
import { userRepository } from '../../repositories/userRepository.js';
import { auditLogRepository } from '../../repositories/auditLogRepository.js';
import { adminRepository } from './repositories/adminRepository.js';
import { hashPassword } from '../../shared/helpers/password.js';

export const adminService = {
  /**
   * Get admin dashboard statistics
   */
  async getDashboardStats() {
    return adminRepository.getDashboardStats();
  },

  /**
   * Get all tenants for admin listing
   */
  async getAllTenants(options = {}) {
    return tenantService.getAllTenants(options);
  },

  /**
   * Get tenant by ID for admin
   */
  async getTenantById(id) {
    return tenantService.getTenantById(id);
  },

  /**
   * Create new tenant through admin panel
   */
  async createTenant(tenantData, adminUserId, ip) {
    return tenantService.createTenant(tenantData, adminUserId, ip);
  },

  /**
   * Update tenant through admin panel
   */
  async updateTenant(id, tenantData, adminUserId, ip) {
    return tenantService.updateTenant(id, tenantData, adminUserId, ip);
  },

  /**
   * Toggle tenant active status
   */
  async toggleTenantActive(id, adminUserId, ip) {
    return tenantService.toggleTenantActive(id, adminUserId, ip);
  },

  /**
   * Delete tenant through admin panel
   */
  async deleteTenant(id) {
    return tenantService.deleteTenant(id);
  },

  /**
   * Get all users for admin listing
   */
  async getAllUsers(options = {}) {
    return userRepository.findAll(options);
  },

  /**
   * Get user by ID for admin
   */
  async getUserById(id) {
    return userRepository.findById(id);
  },

  /**
   * Create new user through admin panel
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

    // Log creation
    await auditLogRepository.logCRUD(
      adminUserId,
      user.tenantId,
      'CREATE',
      'USER',
      user.id,
      ip
    );

    return user;
  },

  /**
   * Update user through admin panel
   */
  async updateUser(id, userData, adminUserId, ip) {
    const updatedUser = await userRepository.update(id, userData);

    // Log update
    await auditLogRepository.logCRUD(
      adminUserId,
      null,
      'UPDATE',
      'USER',
      id,
      ip
    );

    return updatedUser;
  },

  /**
   * Delete user through admin panel
   */
  async deleteUser(id, adminUserId, ip) {
    await userRepository.delete(id);

    // Log deletion
    await auditLogRepository.logCRUD(
      adminUserId,
      null,
      'DELETE',
      'USER',
      id,
      ip
    );
  }
};
