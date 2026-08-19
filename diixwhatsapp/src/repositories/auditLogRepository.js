import { prisma } from '../infrastructure/database/prismaClient.js';

/**
 * Audit Log Repository - Data access layer for AuditLog entity
 */
export const auditLogRepository = {
  /**
   * Create a new audit log entry
   */
  async create(data) {
    return prisma.auditLog.create({
      data
    });
  },

  /**
   * Find audit logs with filters
   */
  async findAll(filters = {}, limit = 100) {
    return prisma.auditLog.findMany({
      where: {
        ...(filters.userId && { userId: filters.userId }),
        ...(filters.tenantId && { tenantId: filters.tenantId }),
        ...(filters.action && { action: filters.action }),
        ...(filters.entity && { entity: filters.entity })
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        },
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
      },
      take: limit
    });
  },

  /**
   * Find audit logs by user
   */
  async findByUser(userId, limit = 50) {
    return prisma.auditLog.findMany({
      where: { userId },
      include: {
        tenant: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  },

  /**
   * Find audit logs by tenant
   */
  async findByTenant(tenantId, limit = 100) {
    return prisma.auditLog.findMany({
      where: { tenantId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    });
  },

  /**
   * Log authentication event
   */
  async logAuth(userId, action, ip, userAgent) {
    return this.create({
      userId,
      action,
      entity: 'AUTH',
      ip,
      userAgent
    });
  },

  /**
   * Log CRUD operation
   */
  async logCRUD(userId, tenantId, action, entity, entityId, ip) {
    return this.create({
      userId,
      tenantId,
      action,
      entity,
      entityId,
      ip
    });
  }
};
