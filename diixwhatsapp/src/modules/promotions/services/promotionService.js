import { promotionRepository } from '../repositories/promotionRepository.js';
import { createPromotionSchema, updatePromotionSchema } from '../validators/promotionValidator.js';

/**
 * Promotion Service - Business logic layer for Promotion entity
 */
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
      throw new Error('Promotion not found');
    }
    return promotion;
  },

  /**
   * Create a new promotion
   */
  async createPromotion(data) {
    // Validate input data
    const validatedData = createPromotionSchema.parse(data);

    // Additional business validation based on discountType
    if (validatedData.discountType === 'PERCENTAGE' && validatedData.discountValue > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }

    return promotionRepository.create(validatedData);
  },

  /**
   * Update an existing promotion
   */
  async updatePromotion(id, tenantId, data) {
    // Check if promotion exists for this tenant
    const existing = await promotionRepository.findByIdAndTenant(id, tenantId);
    if (!existing) {
      throw new Error('Promotion not found');
    }

    // Validate update data
    const validatedData = updatePromotionSchema.parse(data);

    // Additional business validation based on discountType
    if (validatedData.discountType === 'PERCENTAGE' && validatedData.discountValue > 100) {
      throw new Error('Percentage discount cannot exceed 100%');
    }

    return promotionRepository.update(id, tenantId, validatedData);
  },

  /**
   * Delete a promotion
   */
  async deletePromotion(id, tenantId) {
    const existing = await promotionRepository.findByIdAndTenant(id, tenantId);
    if (!existing) {
      throw new Error('Promotion not found');
    }

    return promotionRepository.delete(id, tenantId);
  },

  /**
   * Toggle promotion active status
   */
  async togglePromotionStatus(id, tenantId) {
    const promotion = await promotionRepository.findByIdAndTenant(id, tenantId);
    if (!promotion) {
      throw new Error('Promotion not found');
    }

    return promotionRepository.toggleActive(id, tenantId);
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
