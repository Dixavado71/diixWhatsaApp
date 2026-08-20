/**
 * Service Controller - HTTP layer for Service entity (API ONLY)
 * Responsibilities:
 * - Receive request
 * - Get authenticated context
 * - Validate input
 * - Call service
 * - Delegate errors to global handler
 */
import { serviceService } from '../services/serviceService.js';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceValidator.js';

export const serviceController = {
  /**
   * List all services for the authenticated tenant
   */
  listServices: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
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
      next(error); // Delegado ao errorHandler global
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
  createService: async (req, res, next) => {
    try {
      const validatedData = createServiceSchema.parse(req.body);
      const tenantId = req.session.user.tenantId;
      
      const service = await serviceService.createService(tenantId, validatedData);
      
      res.status(201).json({
        success: true,
        message: 'Serviço criado com sucesso',
        data: service
      });
    } catch (error) {
      next(error); // O middleware global captura e formata o ZodError automaticamente
    }
  },

  /**
   * Show edit service data (API equivalent of show edit form)
   */
  showEditService: async (req, res, next) => {
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
      next(error);
    }
  },

  /**
   * Update an existing service
   */
  updateService: async (req, res, next) => {
    try {
      const validatedData = updateServiceSchema.parse(req.body);
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
      next(error);
    }
  },

  /**
   * Delete a service
   */
  deleteService: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      
      await serviceService.deleteService(req.params.id, tenantId);
      
      res.json({
        success: true,
        message: 'Serviço excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  }
};