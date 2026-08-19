import { promotionService } from '../services/promotionService.js';

/**
 * Promotion Controller - HTTP request handling for Promotion entity
 */
export const promotionController = {
  /**
   * List all promotions for the tenant
   */
  listPromotions: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      const filters = {};

      // Extract optional filters from query params
      if (req.query.active !== undefined) {
        filters.active = req.query.active === 'true';
      }

      const promotions = await promotionService.getPromotions(tenantId, filters);

      res.render('tenant/promotions/index', {
        page: 'promotions',
        promotions
      });
    } catch (error) {
      console.error('List promotions error:', error);
      res.render('tenant/promotions/index', {
        page: 'promotions',
        promotions: [],
        error: 'Failed to load promotions'
      });
    }
  },

  /**
   * Show form to create a new promotion
   */
  showNewPromotion: (req, res) => {
    res.render('tenant/promotions/new', {
      page: 'promotions',
      promotion: null,
      error: null
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

      // Log audit event (if audit log service is available)
      try {
        await auditLogService.log({
          tenantId,
          userId: req.session.user.id,
          action: 'CREATE',
          entityType: 'PROMOTION',
          entityId: promotion.id,
          details: { name: promotion.name }
        });
      } catch (auditError) {
        // Audit logging failure should not block the main operation
        console.warn('Audit log failed:', auditError.message);
      }

      res.redirect('/tenant/promotions');
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.render('tenant/promotions/new', {
          page: 'promotions',
          promotion: req.body,
          error: error.errors.map(e => e.message).join(', ')
        });
      }

      console.error('Create promotion error:', error);
      res.render('tenant/promotions/new', {
        page: 'promotions',
        promotion: req.body,
        error: error.message || 'Failed to create promotion'
      });
    }
  },

  /**
   * Show form to edit an existing promotion
   */
  showEditPromotion: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const promotion = await promotionService.getPromotionById(req.params.id, tenantId);

      res.render('tenant/promotions/edit', {
        page: 'promotions',
        promotion
      });
    } catch (error) {
      console.error('Show edit promotion error:', error);
      res.redirect('/tenant/promotions');
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
        return res.status(404).json({ error: 'Promotion not found' });
      }

      // Log audit event
      try {
        await auditLogService.log({
          tenantId,
          userId: req.session.user.id,
          action: 'UPDATE',
          entityType: 'PROMOTION',
          entityId: promotion.id,
          details: { name: promotion.name }
        });
      } catch (auditError) {
        console.warn('Audit log failed:', auditError.message);
      }

      res.redirect('/tenant/promotions');
    } catch (error) {
      if (error.name === 'ZodError') {
        return res.render('tenant/promotions/edit', {
          page: 'promotions',
          promotion: await promotionService.getPromotionById(req.params.id, req.session.user.tenantId),
          error: error.errors.map(e => e.message).join(', ')
        });
      }

      console.error('Update promotion error:', error);
      res.render('tenant/promotions/edit', {
        page: 'promotions',
        promotion: await promotionService.getPromotionById(req.params.id, req.session.user.tenantId),
        error: error.message || 'Failed to update promotion'
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
        await auditLogService.log({
          tenantId,
          userId: req.session.user.id,
          action: 'DELETE',
          entityType: 'PROMOTION',
          entityId: req.params.id
        });
      } catch (auditError) {
        console.warn('Audit log failed:', auditError.message);
      }

      res.redirect('/tenant/promotions');
    } catch (error) {
      console.error('Delete promotion error:', error);
      res.redirect('/tenant/promotions');
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
        return res.status(404).json({ error: 'Promotion not found' });
      }

      res.json({ success: true, promotion });
    } catch (error) {
      console.error('Toggle promotion status error:', error);
      res.status(400).json({ error: error.message });
    }
  }
};

// Import schemas for validation in controller
import { createPromotionSchema, updatePromotionSchema } from '../validators/promotionValidator.js';

// Import audit log service (optional, with fallback)
import { auditLogService } from '../../services/auditLogService.js'.catch(() => ({
  log: async () => {}
}));
