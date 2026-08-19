/**
 * Client Controller - Handle HTTP requests for Client entity (API ONLY)
 * Responsibilities:
 * - Receive request
 * - Get authenticated context
 * - Validate input
 * - Call service
 * - Return JSON response
 */
import { clientService } from '../services/clientService.js';
import { createClientSchema, updateClientSchema } from '../validators/clientValidator.js';

export const clientController = {
  /**
   * List all clients for the tenant
   */
  listClients: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const clients = await clientService.getAllClients(tenantId);

      res.json({
        success: true,
        data: { clients }
      });
    } catch (error) {
      console.error('List clients error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar clientes'
      });
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
  createClient: async (req, res) => {
    try {
      const validatedData = createClientSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;

      const client = await clientService.createClient(validatedData, tenantId);

      // Log creation would go here (auditLog service to be integrated)

      res.status(201).json({
        success: true,
        message: 'Cliente criado com sucesso',
        data: client
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }

      console.error('Create client error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao criar cliente'
      });
    }
  },

  /**
   * Show edit client data (API equivalent of show edit form)
   */
  showEditClient: async (req, res) => {
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
      console.error('Show edit client error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar dados do cliente'
      });
    }
  },

  /**
   * Update a client
   */
  updateClient: async (req, res) => {
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

      // Log update would go here

      res.json({
        success: true,
        message: 'Cliente atualizado com sucesso',
        data: client
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.status(400).json({
          success: false,
          error: errorMessage
        });
      }

      console.error('Update client error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao atualizar cliente'
      });
    }
  },

  /**
   * Delete a client
   */
  deleteClient: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;

      await clientService.deleteClient(req.params.id, tenantId);

      // Log deletion would go here

      res.json({
        success: true,
        message: 'Cliente excluído com sucesso'
      });
    } catch (error) {
      console.error('Delete client error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao excluir cliente'
      });
    }
  }
};