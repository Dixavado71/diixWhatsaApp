import { promotionService } from '../services/promotionService.js';
import { createPromotionSchema, updatePromotionSchema } from '../validators/promotionValidator.js';
import { auditLogRepository } from '../../../repositories/auditLogRepository.js';

/**
 * Promotion Controller - HTTP request handling for Promotion entity (API ONLY)
 */
export const promotionController = {
  /**
   * List all promotions for the tenant
   */
  listPromotions: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const filters = {};

      // Extract optional filters from query params
      if (req.query.active !== undefined) {
        filters.active = req.query.active === 'true';
      }

      const promotions = await promotionService.getPromotions(tenantId, filters);

      res.json({
        success: true,
        data: { promotions }
      });
    } catch (error) {
      console.error('List promotions error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar promoções'
      });
    }
  },

  /**
   * Show form to create a new promotion (API metadata endpoint)
   */
  showNewPromotion: (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint pronto. Envie um POST com os dados da nova promoção.'
    });
  },

  /**
   * Create a new promotion
   */
  createPromotion: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const validatedData = createPromotionSchema.parse(req.body);

      // Add tenantId to the data
      const dataWithTenant = {
        ...validatedData,
        tenantId
      };

      const promotion = await promotionService.createPromotion(dataWithTenant);

      // Log audit event
      try {
        await auditLogRepository.logCRUD(
          req.session.user.id,
          tenantId,
          'CREATE',
          'PROMOTION',
          promotion.id,
          req.ip
        );
      } catch (auditError) {
        console.warn('Audit log failed:', auditError.message);
      }

      res.status(201).json({
        success: true,
        message: 'Promoção criada com sucesso',
        data: promotion
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(', ')
        });
      }

      console.error('Create promotion error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar promoção'
      });
    }
  },

  /**
   * Show form to edit an existing promotion (API data endpoint)
   */
  showEditPromotion: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const promotion = await promotionService.getPromotionById(req.params.id, tenantId);

      if (!promotion) {
        return res.status(404).json({
          success: false,
          error: 'Promoção não encontrada'
        });
      }

      res.json({
        success: true,
        data: { promotion }
      });
    } catch (error) {
      console.error('Show edit promotion error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar dados da promoção'
      });
    }
  },

  /**
   * Update an existing promotion
   */
  updatePromotion: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const validatedData = updatePromotionSchema.parse(req.body);

      const promotion = await promotionService.updatePromotion(req.params.id, tenantId, validatedData);

      if (!promotion) {
        return res.status(404).json({
          success: false,
          error: 'Promoção não encontrada'
        });
      }

      // Log audit event
      try {
        await auditLogRepository.logCRUD(
          req.session.user.id,
          tenantId,
          'UPDATE',
          'PROMOTION',
          promotion.id,
          req.ip
        );
      } catch (auditError) {
        console.warn('Audit log failed:', auditError.message);
      }

      res.json({
        success: true,
        message: 'Promoção atualizada com sucesso',
        data: promotion
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(', ')
        });
      }

      console.error('Update promotion error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao atualizar promoção'
      });
    }
  },

  /**
   * Delete a promotion
   */
  deletePromotion: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;

      await promotionService.deletePromotion(req.params.id, tenantId);

      // Log audit event
      try {
        await auditLogRepository.logCRUD(
          req.session.user.id,
          tenantId,
          'DELETE',
          'PROMOTION',
          req.params.id,
          req.ip
        );
      } catch (auditError) {
        console.warn('Audit log failed:', auditError.message);
      }

      res.json({
        success: true,
        message: 'Promoção excluída com sucesso'
      });
    } catch (error) {
      console.error('Delete promotion error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao excluir promoção'
      });
    }
  },

  /**
   * Toggle promotion active status
   */
  togglePromotionStatus: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const promotion = await promotionService.togglePromotionStatus(req.params.id, tenantId);

      if (!promotion) {
        return res.status(404).json({
          success: false,
          error: 'Promoção não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Status da promoção atualizado',
        data: { promotion }
      });
    } catch (error) {
      console.error('Toggle promotion status error:', error);
      res.status(400).json({
        success: false,
        error: error.message
      });
    }
  }
};