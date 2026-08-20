import { prisma, logger } from '../infrastructure/database/prismaClient.js';

/**
 * Audit Log Repository - Data access layer for AuditLog entity
 *
 * All write operations are performed asynchronously to avoid blocking
 * the response cycle. Uses setImmediate() for in-memory queuing.
 * Errors are logged internally via Pino but do not throw to avoid
 * breaking the main application flow (fire-and-forget pattern).
 */
export const auditLogRepository = {
  /**
   * Create a new audit log entry (asynchronous, non-blocking)
   * 
   * @param {Object} data - Audit log data
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async create(data) {
    // Use setImmediate to defer database write to next event loop iteration
    // This ensures the response is sent without waiting for the log to be written
    return new Promise((resolve) => {
      setImmediate(async () => {
        try {
          await prisma.auditLog.create({ data });
          resolve({ success: true });
        } catch (error) {
          // Log error via Pino but don't throw - audit logging should not break main flow
          logger.error({ error: error.message, data }, '[AuditLog] Failed to create log entry');
          resolve({ success: false, error: error.message });
        }
      });
    });
  },

  /**
   * Find audit logs with filters
   * 
   * @param {Object} filters - Filter criteria
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>}
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
   * 
   * @param {string} userId - User ID
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>}
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
   * 
   * @param {string} tenantId - Tenant ID
   * @param {number} limit - Maximum number of records to return
   * @returns {Promise<Array>}
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
   * 
   * @param {string} userId - User ID
   * @param {string} action - Action type (LOGIN, LOGOUT, etc.)
   * @param {string} ip - IP address
   * @param {string} userAgent - User agent string
   * @returns {Promise<{success: boolean, error?: string}>}
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
   * 
   * @param {string} userId - User ID
   * @param {string} tenantId - Tenant ID
   * @param {string} action - Action type (CREATE, UPDATE, DELETE)
   * @param {string} entity - Entity name
   * @param {string} entityId - Entity ID
   * @param {string} ip - IP address
   * @returns {Promise<{success: boolean, error?: string}>}
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
