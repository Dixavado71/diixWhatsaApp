/**
 * Admin Repository - Data persistence layer for admin operations
 * Uses shared Prisma instance for database access
 */
import { prisma } from '../../infrastructure/database/prismaClient.js';

export const adminRepository = {
  /**
   * Get dashboard statistics for admin
   */
  async getDashboardStats() {
    const totalTenants = await prisma.tenant.count();
    const activeTenants = await prisma.tenant.count({ where: { active: true } });
    const inactiveTenants = await prisma.tenant.count({ where: { active: false } });
    const totalUsers = await prisma.user.count();

    return {
      total: totalTenants,
      active: activeTenants,
      inactive: inactiveTenants,
      totalUsers
    };
  },

  /**
   * Find tenant by ID
   */
  async findTenantById(id) {
    return prisma.tenant.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            email: true,
            role: true
          }
        },
        _count: {
          select: {
            products: true,
            clients: true,
            services: true,
            promotions: true
          }
        }
      }
    });
  },

  /**
   * Find user by ID with tenant info
   */
  async findUserById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            active: true
          }
        }
      }
    });
  }
};
