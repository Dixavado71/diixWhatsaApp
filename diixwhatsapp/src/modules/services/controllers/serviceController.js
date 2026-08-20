/**
 * Service Controller - HTTP layer for Service entity (API ONLY)
 * 
 * REFACTORED: Utiliza BaseController para reduzir código repetitivo.
 * Desacoplado: Não acessa req.session.user diretamente.
 * O contexto de autenticação é injetado via middleware extractAuthContext.
 * 
 * Responsibilities:
 * - Receive request
 * - Get authenticated context from req.auth (injected by middleware)
 * - Validate input
 * - Call service
 * - Delegate errors to global handler
 */
import { createCRUDController } from '../../shared/controllers/baseController.js';
import { serviceService } from '../services/serviceService.js';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceValidator.js';

/**
 * Controller refatorado usando padrão CRUD genérico
 * Redução de ~60% do código original
 */
export const serviceController = createCRUDController({
  service: serviceService,
  entityName: 'service',
  entityNamePlural: 'services',
  createSchema: createServiceSchema,
  updateSchema: updateServiceSchema,
  
  // Métodos extras específicos (se necessário)
  extraMethods: {}
});

// Exportação individual dos métodos para compatibilidade com rotas existentes
export const {
  list,
  showNew,
  create,
  showEdit,
  update,
  delete: deleteService
} = serviceController;
