import { serviceService } from '../services/serviceService.js';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceValidator.js';

/**
 * Service Controller - HTTP layer for Service entity
 */
export const serviceController = {
  /**
   * List all services for the authenticated tenant
   */
  listServices: async (req, res, next) => {
    try {
      const tenantId = req.session.user.tenantId;
      
      // Extract filters from query params
      const filters = {};
      if (req.query.active !== undefined) {
        filters.active = req.query.active === 'true';
      }
      
      const services = await serviceService.getAllServices(tenantId, filters);
      
      res.render('tenant/services/index', {
        services
      });
    } catch (error) {
      console.error('List services error:', error);
      res.render('tenant/services/index', {
        services: [],
        error: 'Failed to load services'
      });
    }
  },

  /**
   * Show form to create a new service
   */
  showNewService: (req, res) => {
    res.render('tenant/services/new', {
      service: null,
      error: null
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
      
      // Flash message for success
      req.flash('success', 'Service created successfully');
      
      res.redirect('/tenant/services');
    } catch (error) {
      console.error('Create service error:', error);
      
      if (error.name === 'ZodError') {
        return res.render('tenant/services/new', {
          service: req.body,
          error: error.errors.map(e => e.message).join(', ')
        });
      }
      
      res.render('tenant/services/new', {
        service: req.body,
        error: 'Failed to create service'
      });
    }
  },

  /**
   * Show form to edit an existing service
   */
  showEditService: async (req, res) => {
    try {
      const tenantId = req.session.user.tenantId;
      const service = await serviceService.getServiceById(req.params.id, tenantId);
      
      res.render('tenant/services/edit', {
        service,
        error: null
      });
    } catch (error) {
      console.error('Show edit service error:', error);
      req.flash('error', 'Service not found');
      res.redirect('/tenant/services');
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
      
      // Flash message for success
      req.flash('success', 'Service updated successfully');
      
      res.redirect('/tenant/services');
    } catch (error) {
      console.error('Update service error:', error);
      
      if (error.name === 'ZodError') {
        return res.render('tenant/services/edit', {
          service: req.body,
          error: error.errors.map(e => e.message).join(', ')
        });
      }
      
      res.render('tenant/services/edit', {
        service: await serviceService.getServiceById(req.params.id, req.session.user.tenantId).catch(() => req.body),
        error: 'Failed to update service'
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
      
      // Flash message for success
      req.flash('success', 'Service deleted successfully');
    } catch (error) {
      console.error('Delete service error:', error);
      req.flash('error', 'Failed to delete service');
    } finally {
      res.redirect('/tenant/services');
    }
  }
};

