/**
 * Client Controller - Handle HTTP requests for Client entity
 * Responsibilities:
 * - Receive request
 * - Get authenticated context
 * - Validate input
 * - Call service
 * - Return response
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

      res.render('tenant/clients/index', {
        title: 'Clientes',
        clients
      });
    } catch (error) {
      console.error('List clients error:', error);
      res.render('tenant/clients/index', {
        title: 'Clientes',
        clients: [],
        error: 'Erro ao carregar clientes'
      });
    }
  },

  /**
   * Show new client form
   */
  showNewClient: (req, res) => {
    res.render('tenant/clients/new', {
      title: 'Novo Cliente',
      client: null,
      error: null
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

      res.redirect('/tenant/clients');
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        const errorMessage = error.errors[0]?.message || 'Dados inválidos';
        return res.render('tenant/clients/new', {
          title: 'Novo Cliente',
          client: req.body,
          error: errorMessage
        });
      }

      console.error('Create client error:', error);
      res.render('tenant/clients/new', {
        title: 'Novo Cliente',
        client: req.body,
        error: error.message || 'Erro ao criar cliente'
      });
    }
  },

  /**
   * Show edit client form
   */
  showEditClient: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const client = await clientService.getClientById(req.params.id, tenantId);

      if (!client) {
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Cliente não encontrado'
        });
      }

      res.render('tenant/clients/edit', {
        title: 'Editar Cliente',
        client
      });
    } catch (error) {
      console.error('Show edit client error:', error);
      res.redirect('/tenant/clients');
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
        return res.status(404).render('errors/404', {
          title: 'Não Encontrado',
          message: 'Cliente não encontrado'
        });
      }

      // Log update would go here

      res.redirect('/tenant/clients');
    } catch (error) {
      console.error('Update client error:', error);
      const client = await clientService.getClientById(req.params.id, req.session.user.tenantId);
      res.render('tenant/clients/edit', {
        title: 'Editar Cliente',
        client,
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

      res.redirect('/tenant/clients');
    } catch (error) {
      console.error('Delete client error:', error);
      res.redirect('/tenant/clients');
    }
  }
};
