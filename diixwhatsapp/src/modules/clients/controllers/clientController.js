/**
 * Client Controller - Handle HTTP requests for Client entity (API ONLY)
 * 
 * REFACTORED: Utiliza BaseController para reduzir código repetitivo.
 * Desacoplado: Não acessa req.session.user diretamente.
 * O contexto de autenticação é injetado via middleware extractAuthContext.
 */
import { createCRUDController, extractAuthContext } from '../../shared/controllers/baseController.js';
import { clientService } from '../services/clientService.js';
import { createClientSchema, updateClientSchema } from '../validators/clientValidator.js';

// Middleware para ser usado nas rotas antes dos handlers
export { extractAuthContext };

/**
 * Controller refatorado usando padrão CRUD genérico
 * Redução de ~60% do código original
 */
export const clientController = createCRUDController({
  service: clientService,
  entityName: 'client',
  entityNamePlural: 'clients',
  createSchema: createClientSchema,
  updateSchema: updateClientSchema,
  
  // Métodos extras específicos (se necessário)
  extraMethods: {
    /**
     * Exemplo de método customizado adicional
     * Toggle client active status
     */
    toggleActive: async (req, res, next) => {
      try {
        const { tenantId, userId, ip } = req.auth;
        
        const client = await clientService.toggleClientActive(req.params.id, tenantId);
        
        res.json({
          success: true,
          message: 'Status do cliente atualizado com sucesso',
          data: client
        });
      } catch (error) {
        next(error);
      }
    },
    
    /**
     * Exemplo de método customizado: Search clients
     */
    search: async (req, res, next) => {
      try {
        const { tenantId } = req.auth;
        const { q } = req.query;
        
        const clients = await clientService.searchClients(tenantId, q);
        
        res.json({
          success: true,
          data: { clients }
        });
      } catch (error) {
        next(error);
      }
    }
  }
});

// Exportação individual dos métodos para compatibilidade com rotas existentes
export const {
  list,
  showNew,
  create,
  showEdit,
  update,
  delete: deleteClient,
  toggleActive,
  search
} = clientController;