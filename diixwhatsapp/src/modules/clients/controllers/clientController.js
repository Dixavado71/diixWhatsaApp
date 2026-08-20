/**
 * Client Controller - Handle HTTP requests for Client entity (API ONLY)
 * Responsibilities:
 * - Receive request
 * - Get authenticated context
 * - Validate input
 * - Call service
 * - Delegate errors to global handler
 */
import { clientService } from '../services/clientService.js';
import { createClientSchema, updateClientSchema } from '../validators/clientValidator.js';

export const clientController = {
  /**
   * List all clients for the tenant
   */
  listClients: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      const clients = await clientService.getAllClients(tenantId);

      res.json({
        success: true,
        data: { clients }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Show new client metadata (API equivalent of show form)
   */
  showNewClient: (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint pronto. Envie um POST com os dados do novo cliente.'
    });
  },

  /**
   * Create a new client
   */
  createClient: async (req, res, next) => {
    try {
      const validatedData = createClientSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      const client = await clientService.createClient(validatedData, tenantId);

      res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: client
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Show edit client data (API equivalent of show edit form)
   */
  showEditClient: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      const client = await clientService.getClientById(req.params.id, tenantId);

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      res.json({
        success: true,
        data: { client }
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update a client
   */
  updateClient: async (req, res, next) => {
    try {
      const validatedData = updateClientSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      const client = await clientService.updateClient(req.params.id, tenantId, validatedData);

      if (!client) {
        return res.status(404).json({
          success: false,
          error: 'Cliente não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: client
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete a client
   */
  deleteClient: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;

      await clientService.deleteClient(req.params.id, tenantId);

      res.json({
        success: true,
        message: 'Cliente excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
};