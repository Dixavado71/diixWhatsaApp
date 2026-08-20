/**
 * Promotion Controller - HTTP request handling for Promotion entity (API ONLY)
 * 
 * NOTE: A lógica de auditoria (auditLogRepository) foi removida deste controller 
 * para manter o Princípio da Responsabilidade Única. Ela é executada internamente 
 * pelo promotionService, que agora recebe adminUserId e ip como parâmetros.
 */
import { promotionService } from '../services/promotionService.js';
import { createPromotionSchema, updatePromotionSchema } from '../validators/promotionValidator.js';

export const promotionController = {
  /**
   * List all promotions for the tenant
   */
  listPromotions: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      const filters = {};

      if (req.query.active !== undefined) {
        filters.active = req.query.active === 'true';
      }

      const promotions = await promotionService.getPromotions(tenantId, filters);

      res.json({
        success: true,
        data: { promotions }
      });
    } catch (error) {
      next(error);
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
  createPromotion: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      const validatedData = createPromotionSchema.parse(req.body);
      
      // Dados necessários para o Service (Auditoria)
      const adminUserId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      const dataWithTenant = {
        ...validatedData,
        tenantId
      };

      const promotion = await promotionService.createPromotion(dataWithTenant, adminUserId, ip);

      res.status(201).json({
        success: true,
        message: 'Promoção criada com sucesso',
        data: promotion
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Show form to edit an existing promotion (API data endpoint)
   */
  showEditPromotion: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      const promotion = await promotionService.getPromotionById(req.params.id, tenantId);

      res.json({
        success: true,
        data: { promotion }
      });
    } catch (error) {
      next(error); // O service lança erro se não encontrar, o middleware global trata como 404 ou 500
    }
  },

  /**
   * Update an existing promotion
   */
  updatePromotion: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      const validatedData = updatePromotionSchema.parse(req.body);
      
      // Dados necessários para o Service (Auditoria)
      const adminUserId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      // O service já verifica se existe e lança erro se não encontrar
      const promotion = await promotionService.updatePromotion(req.params.id, tenantId, validatedData, adminUserId, ip);

      res.json({
        success: true,
        message: 'Promoção atualizada com sucesso',
        data: promotion
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a promotion
   */
  deletePromotion: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      
      // Dados necessários para o Service (Auditoria)
      const adminUserId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      await promotionService.deletePromotion(req.params.id, tenantId, adminUserId, ip);

      res.json({
        success: true,
        message: 'Promoção excluída com sucesso'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Toggle promotion active status
   */
  togglePromotionStatus: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      
      // Dados necessários para o Service (Auditoria)
      const adminUserId = req.session.user.id;
      const ip = req.ip || req.connection.remoteAddress;

      // O service já verifica se existe e lança erro se não encontrar
      const promotion = await promotionService.togglePromotionStatus(req.params.id, tenantId, adminUserId, ip);

      res.json({
        success: true,
        message: 'Status da promoção atualizado',
        data: { promotion }
      });
    } catch (error) {
      next(error);
    }
  }
};