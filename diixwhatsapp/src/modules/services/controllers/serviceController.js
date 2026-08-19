/**
 * Service Controller - HTTP layer for Service entity (API ONLY)
 * Responsibilities:
 * - Receive request
 * - Get authenticated context
 * - Validate input
 * - Call service
 * - Return JSON response
 */
import { serviceService } from '../services/serviceService.js';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceValidator.js';

export const serviceController = {
  /**
   * List all services for the authenticated tenant
   */
  listServices: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      
      // Extract filters from query params
      const filters = {};
      if (req.query.active !== undefined) {
        filters.active = req.query.active === 'true';
      }
      
      const services = await serviceService.getAllServices(tenantId, filters);
      
      res.json({
        success: true,
        data: { services }
      });
    } catch (error) {
      console.error('List services error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar serviços'
      });
    }
  },

  /**
   * Show new service metadata (API equivalent of show form)
   */
  showNewService: (req, res) => {
    res.json({
      success: true,
      message: 'Endpoint pronto. Envie um POST com os dados do novo serviço.'
    });
  },

  /**
   * Create a new service
   */
  createService: async (req, res) => {
    try {
      const validatedData = createServiceSchema.parse(req.body);
      
      // Get tenantId from authenticated user context - NEVER trust body
      const tenantId = req.session.user.tenantId;
      
      const service = await serviceService.createService(tenantId, validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Serviço criado com sucesso',
        data: service
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(', ')
        });
      }
      
      console.error('Create service error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar serviço'
      });
    }
  },

  /**
   * Show edit service data (API equivalent of show edit form)
   */
  showEditService: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const service = await serviceService.getServiceById(req.params.id, tenantId);
      
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Serviço não encontrado'
        });
      }
      
      res.json({
        success: true,
        data: { service }
      });
    } catch (error) {
      console.error('Show edit service error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao carregar dados do serviço'
      });
    }
  },

  /**
   * Update an existing service
   */
  updateService: async (req, res) => {
    try {
      const validatedData = updateServiceSchema.parse(req.body);
      
      // Get tenantId from authenticated user context - NEVER trust body
      const tenantId = req.session.user.tenantId;
      
      const service = await serviceService.updateService(req.params.id, tenantId, validatedData);
      
      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Serviço não encontrado'
        });
      }
      
      res.json({
        success: true,
        message: 'Serviço atualizado com sucesso',
        data: service
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({
          success: false,
          error: error.errors.map(e => e.message).join(', ')
        });
      }
      
      console.error('Update service error:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar serviço'
      });
    }
  },

  /**
   * Delete a service
   */
  deleteService: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      
      await serviceService.deleteService(req.params.id, tenantId);
      
      res.json({
        success: true,
        message: 'Serviço excluído com sucesso'
      });
    } catch (error) {
      console.error('Delete service error:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Erro ao excluir serviço'
      });
    }
  }
};