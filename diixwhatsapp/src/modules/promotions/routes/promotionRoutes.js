import { Router } from 'express';
import { promotionController } from '../controllers/promotionController.js';
import { requireTenant } from '../../../shared/middleware/auth.js';
import { extractAuthContext } from '../../../shared/middleware/extractAuthContext.js';

const router = Router();

/**
 * Promotions CRUD Routes
 * SECURITY: All routes now require tenant authentication to prevent unauthorized access
 * 
 * Changes applied:
 * - Added requireTenant middleware to ALL routes (no public promotion endpoints)
 * - Added extractAuthContext to inject req.auth instead of accessing req.session directly
 */

// Apply requireTenant and extractAuthContext middleware to all promotion routes
router.use(requireTenant);
router.use(extractAuthContext);

router.get('/promotions', promotionController.listPromotions);
router.get('/promotions/new', promotionController.showNewPromotion);
router.post('/promotions', promotionController.createPromotion);
router.get('/promotions/:id/edit', promotionController.showEditPromotion);
router.post('/promotions/:id', promotionController.updatePromotion);
router.post('/promotions/:id/delete', promotionController.deletePromotion);

export default router;
