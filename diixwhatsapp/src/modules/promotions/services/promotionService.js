/**
 * Promotion Service - Business logic layer for Promotion entity
 * Responsibilities:
 * - Handle business rules (e.g., discount validation)
 * - Manage audit logging for state-changing operations
 * - Interact with promotionRepository
 */
import { promotionRepository } from '../repositories/promotionRepository.js';
import { auditLogRepository } from '../../../repositories/auditLogRepository.js';
import { createPromotionSchema, updatePromotionSchema } from '../validators/promotionValidator.js';

export const promotionService = {
  /**
   * Get all promotions for a tenant with optional filters
   */
  async getPromotions(tenantId, filters = {}) {
    return promotionRepository.findAllByTenant(tenantId, filters);
  },

  /**
   * Get a single promotion by ID for a tenant
   */
  async getPromotionById(id, tenantId) {
    const promotion = await promotionRepository.findByIdAndTenant(id, tenantId);
    if (!promotion) {
      throw new Error('Promoção não encontrada');
    }
    return promotion;
  },

  /**
   * Create a new promotion
   */
  async createPromotion(data, adminUserId, ip) {
    // 1. Validate input data
    const validatedData = createPromotionSchema.parse(data);

    // 2. Additional business validation based on discountType
    if (validatedData.discountType === 'PERCENTAGE' && validatedData.discountValue > 100) {
      throw new Error('Desconto percentual não pode exceder 100%');
    }

    // 3. Create in database
    const promotion = await promotionRepository.create(validatedData);

    // 4. Audit Log (Centralizado no Service)
    await auditLogRepository.logCRUD(
      adminUserId,
      validatedData.tenantId,
      'CREATE',
      'PROMOTION',
      promotion.id,
      ip
    );

    return promotion;
  },

  /**
   * Update an existing promotion
   */
  async updatePromotion(id, tenantId, data, adminUserId, ip) {
    // 1. Check if promotion exists for this tenant
    const existing = await promotionRepository.findByIdAndTenant(id, tenantId);
    if (!existing) {
      throw new Error('Promoção não encontrada');
    }

    // 2. Validate update data
    const validatedData = updatePromotionSchema.parse(data);

    // 3. Additional business validation based on discountType
    if (validatedData.discountType === 'PERCENTAGE' && validatedData.discountValue > 100) {
      throw new Error('Desconto percentual não pode exceder 100%');
    }

    // 4. Update in database
    const updatedPromotion = await promotionRepository.update(id, tenantId, validatedData);

    // 5. Audit Log
    await auditLogRepository.logCRUD(
      adminUserId,
      tenantId,
      'UPDATE',
      'PROMOTION',
      id,
      ip
    );

    return updatedPromotion;
  },

  /**
   * Delete a promotion
   */
  async deletePromotion(id, tenantId, adminUserId, ip) {
    // 1. Check if promotion exists for this tenant
    const existing = await promotionRepository.findByIdAndTenant(id, tenantId);
    if (!existing) {
      throw new Error('Promoção não encontrada');
    }

    // 2. Delete from database
    await promotionRepository.delete(id, tenantId);

    // 3. Audit Log
    await auditLogRepository.logCRUD(
      adminUserId,
      tenantId,
      'DELETE',
      'PROMOTION',
      id,
      ip
    );

    return true;
  },

  /**
   * Toggle promotion active status
   */
  async togglePromotionStatus(id, tenantId, adminUserId, ip) {
    // 1. Check if promotion exists
    const promotion = await promotionRepository.findByIdAndTenant(id, tenantId);
    if (!promotion) {
      throw new Error('Promoção não encontrada');
    }

    // 2. Toggle status
    const updatedPromotion = await promotionRepository.toggleActive(id, tenantId);

    // 3. Audit Log
    await auditLogRepository.logCRUD(
      adminUserId,
      tenantId,
      updatedPromotion.active ? 'ACTIVATE' : 'DEACTIVATE',
      'PROMOTION',
      id,
      ip
    );

    return updatedPromotion;
  },

  /**
   * Get active promotions for a tenant
   */
  async getActivePromotions(tenantId) {
    return promotionRepository.findActiveByTenant(tenantId);
  },

  /**
   * Count promotions for a tenant
   */
  async countPromotions(tenantId, filters = {}) {
    return promotionRepository.countByTenant(tenantId, filters);
  }
};