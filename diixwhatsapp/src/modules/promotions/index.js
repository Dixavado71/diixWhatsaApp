/**
 * Promotions Module - Public API
 */
import { promotionController } from './controllers/promotionController.js';
import { promotionService } from './services/promotionService.js';
import { promotionRepository } from './repositories/promotionRepository.js';
import promotionRoutes from './routes/promotionRoutes.js';

export {
  promotionController,
  promotionService,
  promotionRepository,
  promotionRoutes
};

export default {
  controller: promotionController,
  service: promotionService,
  repository: promotionRepository,
  routes: promotionRoutes
};
