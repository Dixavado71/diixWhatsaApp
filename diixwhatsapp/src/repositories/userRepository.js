import { prisma } from '../config/database.js';

/**
 * User Repository - Data access layer for User entity
 */
export const userRepository = {
  /**
   * Find all users with optional filters
   */
  async findAll(filters = {}) {
    return prisma.user.findMany({
      where: {
        ...(filters.tenantId && { tenantId: filters.tenantId }),
        ...(filters.role && { role: filters.role }),
        ...(filters.active !== undefined && { active: filters.active })
      },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  },

  /**
   * Find a user by ID
   */
  async findById(id) {
    return prisma.user.findUnique({
      where: { id },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
  },

  /**
   * Find a user by username
   */
  async findByUsername(username) {
    return prisma.user.findUnique({
      where: { username },
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true,
            active: true
          }
        }
      }
    });
  },

  /**
   * Find a user by email
   */
  async findByEmail(email) {
    return prisma.user.findUnique({
      where: { email }
    });
  },

  /**
   * Create a new user
   */
  async create(data) {
    return prisma.user.create({
      data,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
  },

  /**
   * Update a user
   */
  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data,
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
            slug: true
          }
        }
      }
    });
  },

  /**
   * Update user last login timestamp
   */
  async updateLastLogin(id) {
    return prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    });
  },

  /**
   * Toggle user active status
   */
  async toggleActive(id) {
    const user = await this.findById(id);
    if (!user) return null;

    return prisma.user.update({
      where: { id },
      data: { active: !user.active }
    });
  },

  /**
   * Delete a user
   */
  async delete(id) {
    return prisma.user.delete({
      where: { id }
    });
  },

  /**
   * Count users
   */
  async count(filters = {}) {
    return prisma.user.count({
      where: filters
    });
  },

  /**
   * Check if username exists
   */
  async usernameExists(username, excludeId = null) {
    const user = await prisma.user.findFirst({
      where: {
        username,
        ...(excludeId && { id: { not: excludeId } })
      }
    });
    return !!user;
  },

  /**
   * Check if email exists
   */
  async emailExists(email, excludeId = null) {
    const user = await prisma.user.findFirst({
      where: {
        email,
        ...(excludeId && { id: { not: excludeId } })
      }
    });
    return !!user;
  }
};
