import { Router } from 'express';
import { promotionController } from '../controllers/promotionController.js';

const router = Router();

/**
 * Promotions CRUD Routes
 */
router.get('/promotions', promotionController.listPromotions);
router.get('/promotions/new', promotionController.showNewPromotion);
router.post('/promotions', promotionController.createPromotion);
router.get('/promotions/:id/edit', promotionController.showEditPromotion);
router.post('/promotions/:id', promotionController.updatePromotion);
router.post('/promotions/:id/delete', promotionController.deletePromotion);

export default router;
