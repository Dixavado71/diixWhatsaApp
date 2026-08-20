/**
 * Base Controller - Generic CRUD Utility
 *
 * Abstrai o padrão CRUD repetitivo, permitindo que controllers
 * específicos sejam reduzidos em até 60%.
 *
 * Uso:
 * ```javascript
 * export const clientController = createCRUDController({
 *   serviceName: clientService,
 *   entityName: 'client',
 *   createSchema: createClientSchema,
 *   updateSchema: updateClientSchema
 * });
 * ```
 */

/**
 * @typedef {Object} AuthContext
 * @property {string} tenantId - ID do tenant
 * @property {string} userId - ID do usuário autenticado
 * @property {string} role - Role do usuário (MASTER, TENANT_ADMIN, etc.)
 * @property {string} ip - IP da requisição
 */

/**
 * @typedef {Object} CRUDService
 * @property {Function} getAll - (tenantId, filters) => Promise<Array>
 * @property {Function} getById - (id, tenantId) => Promise<Object|null>
 * @property {Function} create - (data, tenantId, userId?, ip?) => Promise<Object>
 * @property {Function} update - (id, tenantId, data, userId?, ip?) => Promise<Object>
 * @property {Function} delete - (id, tenantId, userId?, ip?) => Promise<void>
 */

/**
 * @typedef {Object} SchemaValidator
 * @property {Function} parse - (data) => any
 */

/**
 * Cria um controller CRUD genérico
 *
 * @param {Object} options
 * @param {CRUDService} options.service - Serviço com métodos CRUD
 * @param {string} options.entityName - Nome da entidade (ex: 'client', 'product')
 * @param {string} [options.entityNamePlural] - Nome plural (default: entityName + 's')
 * @param {SchemaValidator} [options.createSchema] - Schema de validação para criação
 * @param {SchemaValidator} [options.updateSchema] - Schema de validação para atualização
 * @param {Object} [options.extraMethods] - Métodos extras para adicionar ao controller
 * @returns {Object} Controller com métodos CRUD padronizados
 */
export function createCRUDController({
  service,
  entityName,
  entityNamePlural,
  createSchema,
  updateSchema,
  extraMethods = {}
}) {
  if (!service) {
    throw new Error('createCRUDController: service é obrigatório');
  }
  if (!entityName) {
    throw new Error('createCRUDController: entityName é obrigatório');
  }

  const plural = entityNamePlural || `${entityName}s`;
  const EntityName = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  return {
    /**
     * Listar todas as entidades do tenant
     * GET /api/{entityNamePlural}
     */
    list: async (req, res, next) => {
      try {
        // Usa req.auth em vez de req.session (Inversão de Dependência)
        const { tenantId } = req.auth;
        const items = await service.getAll(tenantId);

        res.json({
          success: true,
          data: { [plural]: items }
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Mostrar formulário/metadados para nova entidade
     * GET /api/{entityName}/new
     */
    showNew: (req, res) => {
      res.json({
        success: true,
        message: `Endpoint pronto. Envie um POST com os dados do novo ${entityName}.`
      });
    },

    /**
     * Criar nova entidade
     * POST /api/{entityNamePlural}
     */
    create: async (req, res, next) => {
      try {
        const validatedData = createSchema
          ? createSchema.parse(req.body)
          : req.body;

        // Usa req.auth em vez de req.session (Inversão de Dependência)
        const { tenantId, userId, ip } = req.auth;

        const item = await service.create(validatedData, tenantId, userId, ip);

        res.status(201).json({
          success: true,
          message: `${EntityName} criado(a) com sucesso`,
          data: item
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Mostrar dados para edição
     * GET /api/{entityNamePlural}/:id/edit
     */
    showEdit: async (req, res, next) => {
      try {
        // Usa req.auth em vez de req.session (Inversão de Dependência)
        const { tenantId } = req.auth;
        const item = await service.getById(req.params.id, tenantId);

        if (!item) {
          return res.status(404).json({
            success: false,
            error: `${EntityName} não encontrado(a)`
          });
        }

        res.json({
          success: true,
          data: { [entityName]: item }
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Atualizar entidade
     * PUT/PATCH /api/{entityNamePlural}/:id
     */
    update: async (req, res, next) => {
      try {
        const validatedData = updateSchema
          ? updateSchema.parse(req.body)
          : req.body;

        // Usa req.auth em vez de req.session (Inversão de Dependência)
        const { tenantId, userId, ip } = req.auth;

        const item = await service.update(req.params.id, tenantId, validatedData, userId, ip);

        if (!item) {
          return res.status(404).json({
            success: false,
            error: `${EntityName} não encontrado(a)`
          });
        }

        res.json({
          success: true,
          message: `${EntityName} atualizado(a) com sucesso`,
          data: item
        });
      } catch (error) {
        next(error);
      }
    },

    /**
     * Deletar entidade
     * DELETE /api/{entityNamePlural}/:id
     */
    delete: async (req, res, next) => {
      try {
        // Usa req.auth em vez de req.session (Inversão de Dependência)
        const { tenantId, userId, ip } = req.auth;

        await service.delete(req.params.id, tenantId, userId, ip);

        res.json({
          success: true,
          message: `${EntityName} excluído(a) com sucesso`
        });
      } catch (error) {
        next(error);
      }
    },

    // Métodos extras personalizados
    ...extraMethods
  };
}

/**
 * Middleware para extrair contexto de autenticação
 * Deve ser usado ANTES dos handlers do controller
 *
 * Exemplo de uso:
 * ```javascript
 * router.get('/clients', authMiddleware, extractAuthContext, clientController.list);
 * ```
 */
export function extractAuthContext(req, res, next) {
  try {
    if (!req.session || !req.session.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    // Extrai e padroniza o contexto de autenticação
    req.auth = {
      tenantId: req.session.user.tenantId,
      userId: req.session.user.id,
      role: req.session.user.role,
      ip: req.ip || req.connection?.remoteAddress || 'unknown'
    };

    next();
  } catch (error) {
    next(error);
  }
}

export default {
  createCRUDController,
  extractAuthContext
};
