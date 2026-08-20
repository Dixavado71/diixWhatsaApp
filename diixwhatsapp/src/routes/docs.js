import { config } from '../config/env.js';

/**
 * API Documentation endpoint - OpenAPI-style comprehensive documentation
 * Returns complete API specification with all endpoints, request/response schemas, and error codes
 */
export const apiDocsHandler = (req, res) => {
  res.json({
    openapi: '3.0.0',
    info: {
      title: 'DiixWhatsApp API',
      version: '1.0.0',
      description: 'Multi-tenant WhatsApp business management backend API',
      contact: {
        name: 'DiixWhatsApp Support',
        email: 'support@diixwhatsapp.com'
      }
    },
    servers: [
      {
        url: config.apiUrl || 'http://localhost:7171',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        sessionAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'diixwhatsapp.sid',
          description: 'Session cookie obtained after successful login'
        },
        csrfToken: {
          type: 'apiKey',
          in: 'header',
          name: 'X-CSRF-Token',
          description: 'CSRF token required for state-changing requests (POST, PUT, DELETE)'
        }
      },
      schemas: {
        Tenant: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
            name: { type: 'string', example: 'Minha Empresa LTDA' },
            document: { type: 'string', example: '12.345.678/0001-90', description: 'CNPJ' },
            email: { type: 'string', format: 'email', example: 'contato@empresa.com' },
            phone: { type: 'string', example: '+55 11 99999-9999' },
            active: { type: 'boolean', example: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            username: { type: 'string', example: 'joao.silva' },
            email: { type: 'string', format: 'email', example: 'joao@empresa.com' },
            role: { 
              type: 'string', 
              enum: ['MASTER', 'TENANT_ADMIN', 'TENANT_USER'],
              example: 'TENANT_ADMIN'
            },
            tenantId: { type: 'string', format: 'uuid', nullable: true },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tenantId: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Produto A' },
            description: { type: 'string', example: 'Descrição do produto' },
            price: { type: 'number', format: 'decimal', example: 99.90 },
            slug: { type: 'string', example: 'produto-a' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Client: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tenantId: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'João Cliente' },
            email: { type: 'string', format: 'email' },
            phone: { type: 'string', example: '+55 11 98888-7777' },
            document: { type: 'string', example: '123.456.789-00', description: 'CPF or CNPJ' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Service: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tenantId: { type: 'string', format: 'uuid' },
            name: { type: 'string', example: 'Consultoria Técnica' },
            description: { type: 'string' },
            price: { type: 'number', format: 'decimal', example: 150.00 },
            duration: { type: 'integer', example: 60, description: 'Duration in minutes' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Promotion: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            tenantId: { type: 'string', format: 'uuid' },
            title: { type: 'string', example: 'Promoção de Verão' },
            description: { type: 'string' },
            discount: { type: 'number', format: 'decimal', example: 20.00, description: 'Discount percentage' },
            startDate: { type: 'string', format: 'date-time' },
            endDate: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Erro ao processar solicitação' },
            details: { type: 'string', nullable: true }
          }
        }
      }
    },
    security: [{ sessionAuth: [] }],
    paths: {
      // ========================================================================
      // PUBLIC ENDPOINTS
      // ========================================================================
      '/': {
        get: {
          tags: ['Public'],
          summary: 'Get API information',
          description: 'Returns basic API information and available endpoints',
          security: [],
          responses: {
            '200': {
              description: 'API information',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      service: { type: 'string' },
                      version: { type: 'string' },
                      description: { type: 'string' },
                      endpoints: { type: 'object' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/health': {
        get: {
          tags: ['Public'],
          summary: 'Health check',
          description: 'Advanced health check for Database and Redis',
          security: [],
          responses: {
            '200': {
              description: 'All services healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      service: { type: 'string', example: 'DiixWhatsApp' },
                      version: { type: 'string' },
                      timestamp: { type: 'string', format: 'date-time' },
                      environment: { type: 'string' },
                      checks: {
                        type: 'object',
                        properties: {
                          database: { type: 'object' },
                          redis: { type: 'object' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '503': {
              description: 'One or more services unhealthy'
            }
          }
        }
      },
      '/health/db': {
        get: {
          tags: ['Public'],
          summary: 'Database health check',
          description: 'Check only database connection',
          security: [],
          responses: {
            '200': {
              description: 'Database connected',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status: { type: 'string', example: 'ok' },
                      database: { type: 'string', example: 'connected' }
                    }
                  }
                }
              }
            },
            '500': {
              description: 'Database disconnected',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/api-docs': {
        get: {
          tags: ['Public'],
          summary: 'Get API documentation',
          description: 'Returns this comprehensive API documentation',
          security: [],
          responses: {
            '200': {
              description: 'API documentation object'
            }
          }
        }
      },
      '/login': {
        get: {
          tags: ['Authentication'],
          summary: 'Get login status',
          description: 'Returns current authentication status or login instructions',
          security: [],
          responses: {
            '200': {
              description: 'Login status or instructions',
              content: {
                'application/json': {
                  schema: {
                    oneOf: [
                      {
                        type: 'object',
                        properties: {
                          authenticated: { type: 'boolean', example: true },
                          user: { $ref: '#/components/schemas/User' },
                          redirect: { type: 'string' }
                        }
                      },
                      {
                        type: 'object',
                        properties: {
                          authenticated: { type: 'boolean', example: false },
                          message: { type: 'string' },
                          endpoint: { type: 'string' },
                          requiredFields: { type: 'array', items: { type: 'string' } }
                        }
                      }
                    ]
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Authentication'],
          summary: 'Authenticate user',
          description: 'Login with username/email and password. Returns session cookie and CSRF token.',
          security: [],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['identifier', 'password'],
                  properties: {
                    identifier: {
                      type: 'string',
                      example: 'dixavado',
                      description: 'Username or email'
                    },
                    password: {
                      type: 'string',
                      format: 'password',
                      example: 'Sahali1@'
                    }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Login successful',
              headers: {
                'Set-Cookie': {
                  schema: { type: 'string', example: 'diixwhatsapp.sid=xxx; Path=/; HttpOnly' }
                },
                'X-CSRF-Token': {
                  schema: { type: 'string' }
                }
              },
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Login successful' },
                      user: { $ref: '#/components/schemas/User' },
                      redirect: { type: 'string', example: '/tenant/dashboard' }
                    }
                  }
                }
              }
            },
            '400': {
              description: 'Invalid input data',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '401': {
              description: 'Invalid credentials',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            },
            '403': {
              description: 'CSRF token validation failed',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Error' }
                }
              }
            }
          }
        }
      },
      '/logout': {
        post: {
          tags: ['Authentication'],
          summary: 'Logout user',
          description: 'Destroy user session and clear cookies',
          responses: {
            '200': {
              description: 'Logout successful',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean', example: true },
                      message: { type: 'string', example: 'Logout successful' },
                      redirect: { type: 'string', example: '/login' }
                    }
                  }
                }
              }
            }
          }
        }
      },

      // ========================================================================
      // ADMIN ENDPOINTS (MASTER role required)
      // ========================================================================
      '/api/v1/admin/dashboard': {
        get: {
          tags: ['Admin'],
          summary: 'Get admin dashboard',
          description: 'Get statistics and recent tenants data',
          security: [{ sessionAuth: [], csrfToken: [] }],
          responses: {
            '200': {
              description: 'Dashboard data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          stats: { type: 'object' },
                          tenants: { type: 'array', items: { $ref: '#/components/schemas/Tenant' } },
                          recentTenants: { type: 'array', items: { $ref: '#/components/schemas/Tenant' } }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden - MASTER role required' }
          }
        }
      },
      '/api/v1/admin/tenants': {
        get: {
          tags: ['Admin - Tenants'],
          summary: 'List all tenants',
          security: [{ sessionAuth: [], csrfToken: [] }],
          responses: {
            '200': {
              description: 'List of tenants',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          tenants: { type: 'array', items: { $ref: '#/components/schemas/Tenant' } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Admin - Tenants'],
          summary: 'Create new tenant',
          security: [{ sessionAuth: [], csrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'document', 'email', 'phone'],
                  properties: {
                    name: { type: 'string', example: 'Nova Empresa LTDA' },
                    document: { type: 'string', example: '00.000.000/0001-00' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    active: { type: 'boolean', default: true }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Tenant created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/Tenant' }
                    }
                  }
                }
              }
            },
            '400': { description: 'Invalid input' },
            '403': { description: 'Forbidden' }
          }
        }
      },
      '/api/v1/admin/tenants/{id}': {
        get: {
          tags: ['Admin - Tenants'],
          summary: 'Get tenant for editing',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Tenant data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          tenant: { $ref: '#/components/schemas/Tenant' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '404': { description: 'Tenant not found' }
          }
        },
        post: {
          tags: ['Admin - Tenants'],
          summary: 'Update tenant',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    document: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    active: { type: 'boolean' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Tenant updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string', example: 'Loja atualizada com sucesso' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/admin/tenants/{id}/toggle': {
        post: {
          tags: ['Admin - Tenants'],
          summary: 'Toggle tenant active status',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Tenant status toggled',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/admin/tenants/{id}/delete': {
        post: {
          tags: ['Admin - Tenants'],
          summary: 'Delete tenant',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Tenant deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/admin/users': {
        get: {
          tags: ['Admin - Users'],
          summary: 'List all users',
          security: [{ sessionAuth: [], csrfToken: [] }],
          responses: {
            '200': {
              description: 'List of users',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          users: { type: 'array', items: { $ref: '#/components/schemas/User' } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Admin - Users'],
          summary: 'Create new user',
          security: [{ sessionAuth: [], csrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'password', 'email', 'role'],
                  properties: {
                    username: { type: 'string' },
                    password: { type: 'string', format: 'password' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['MASTER', 'TENANT_ADMIN', 'TENANT_USER'] },
                    tenantId: { type: 'string', format: 'uuid', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'User created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/User' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/admin/users/{id}': {
        get: {
          tags: ['Admin - Users'],
          summary: 'Get user for editing',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'User data with active tenants',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          user: { $ref: '#/components/schemas/User' },
                          tenants: { type: 'array', items: { $ref: '#/components/schemas/Tenant' } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Admin - Users'],
          summary: 'Update user',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    username: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    role: { type: 'string', enum: ['MASTER', 'TENANT_ADMIN', 'TENANT_USER'] },
                    tenantId: { type: 'string', format: 'uuid', nullable: true }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'User updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/admin/users/{id}/delete': {
        post: {
          tags: ['Admin - Users'],
          summary: 'Delete user',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'User deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },

      // ========================================================================
      // TENANT ENDPOINTS (TENANT_ADMIN or TENANT_USER role required)
      // ========================================================================
      '/api/v1/tenant/dashboard': {
        get: {
          tags: ['Tenant'],
          summary: 'Get tenant dashboard',
          description: 'Get statistics and recent items for current tenant',
          security: [{ sessionAuth: [], csrfToken: [] }],
          responses: {
            '200': {
              description: 'Dashboard data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          stats: { type: 'object' },
                          recentProducts: { type: 'array' },
                          recentClients: { type: 'array' },
                          recentServices: { type: 'array' },
                          recentPromotions: { type: 'array' }
                        }
                      }
                    }
                  }
                }
              }
            },
            '401': { description: 'Unauthorized' },
            '403': { description: 'Forbidden - TENANT role required' }
          }
        }
      },
      '/api/v1/tenant/products': {
        get: {
          tags: ['Tenant - Products'],
          summary: 'List all products',
          security: [{ sessionAuth: [], csrfToken: [] }],
          responses: {
            '200': {
              description: 'List of products',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          products: { type: 'array', items: { $ref: '#/components/schemas/Product' } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Tenant - Products'],
          summary: 'Create new product',
          security: [{ sessionAuth: [], csrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'description', 'price', 'slug'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number', format: 'decimal' },
                    slug: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Product created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/Product' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/products/{id}': {
        get: {
          tags: ['Tenant - Products'],
          summary: 'Get product for editing',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Product data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          product: { $ref: '#/components/schemas/Product' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Tenant - Products'],
          summary: 'Update product',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number', format: 'decimal' },
                    slug: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Product updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/products/{id}/delete': {
        post: {
          tags: ['Tenant - Products'],
          summary: 'Delete product',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Product deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/clients': {
        get: {
          tags: ['Tenant - Clients'],
          summary: 'List all clients',
          security: [{ sessionAuth: [], csrfToken: [] }],
          responses: {
            '200': {
              description: 'List of clients',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          clients: { type: 'array', items: { $ref: '#/components/schemas/Client' } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Tenant - Clients'],
          summary: 'Create new client',
          security: [{ sessionAuth: [], csrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'phone', 'document'],
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    document: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Client created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/Client' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/clients/{id}': {
        get: {
          tags: ['Tenant - Clients'],
          summary: 'Get client for editing',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Client data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          client: { $ref: '#/components/schemas/Client' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Tenant - Clients'],
          summary: 'Update client',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    email: { type: 'string', format: 'email' },
                    phone: { type: 'string' },
                    document: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Client updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/clients/{id}/delete': {
        post: {
          tags: ['Tenant - Clients'],
          summary: 'Delete client',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Client deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/services': {
        get: {
          tags: ['Tenant - Services'],
          summary: 'List all services',
          security: [{ sessionAuth: [], csrfToken: [] }],
          responses: {
            '200': {
              description: 'List of services',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          services: { type: 'array', items: { $ref: '#/components/schemas/Service' } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Tenant - Services'],
          summary: 'Create new service',
          security: [{ sessionAuth: [], csrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'description', 'price', 'duration'],
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number', format: 'decimal' },
                    duration: { type: 'integer', description: 'Duration in minutes' }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Service created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/Service' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/services/{id}': {
        get: {
          tags: ['Tenant - Services'],
          summary: 'Get service for editing',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Service data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          service: { $ref: '#/components/schemas/Service' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Tenant - Services'],
          summary: 'Update service',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    name: { type: 'string' },
                    description: { type: 'string' },
                    price: { type: 'number', format: 'decimal' },
                    duration: { type: 'integer' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Service updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/services/{id}/delete': {
        post: {
          tags: ['Tenant - Services'],
          summary: 'Delete service',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Service deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/promotions': {
        get: {
          tags: ['Tenant - Promotions'],
          summary: 'List all promotions',
          security: [{ sessionAuth: [], csrfToken: [] }],
          responses: {
            '200': {
              description: 'List of promotions',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          promotions: { type: 'array', items: { $ref: '#/components/schemas/Promotion' } }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Tenant - Promotions'],
          summary: 'Create new promotion',
          security: [{ sessionAuth: [], csrfToken: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title', 'description', 'discount', 'startDate', 'endDate'],
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    discount: { type: 'number', format: 'decimal' },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          responses: {
            '201': {
              description: 'Promotion created',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' },
                      data: { $ref: '#/components/schemas/Promotion' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/promotions/{id}': {
        get: {
          tags: ['Tenant - Promotions'],
          summary: 'Get promotion for editing',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Promotion data',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: {
                        type: 'object',
                        properties: {
                          promotion: { $ref: '#/components/schemas/Promotion' }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        post: {
          tags: ['Tenant - Promotions'],
          summary: 'Update promotion',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string' },
                    description: { type: 'string' },
                    discount: { type: 'number', format: 'decimal' },
                    startDate: { type: 'string', format: 'date-time' },
                    endDate: { type: 'string', format: 'date-time' }
                  }
                }
              }
            }
          },
          responses: {
            '200': {
              description: 'Promotion updated',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      },
      '/api/v1/tenant/promotions/{id}/delete': {
        post: {
          tags: ['Tenant - Promotions'],
          summary: 'Delete promotion',
          security: [{ sessionAuth: [], csrfToken: [] }],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' }
            }
          ],
          responses: {
            '200': {
              description: 'Promotion deleted',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      message: { type: 'string' }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    errorCodes: {
      '400': {
        code: 400,
        name: 'Bad Request',
        description: 'Invalid input data or malformed request',
        example: { success: false, error: 'Dados inválidos', details: 'Campo X é obrigatório' }
      },
      '401': {
        code: 401,
        name: 'Unauthorized',
        description: 'Authentication required - user not logged in',
        example: { success: false, error: 'Não autorizado' }
      },
      '403': {
        code: 403,
        name: 'Forbidden',
        description: 'Insufficient permissions or CSRF validation failed',
        example: { success: false, error: 'Acesso negado', details: 'Requer role MASTER' }
      },
      '404': {
        code: 404,
        name: 'Not Found',
        description: 'Resource does not exist',
        example: { success: false, error: 'Recurso não encontrado' }
      },
      '500': {
        code: 500,
        name: 'Internal Server Error',
        description: 'Server error during request processing',
        example: { success: false, error: 'Erro Interno', details: 'misconfigured csrf' }
      }
    },
    usage: {
      authentication: {
        step1: 'POST /login with { identifier: "username", password: "secret" }',
        step2: 'Receive session cookie (diixwhatsapp.sid) and X-CSRF-Token header',
        step3: 'Include cookie automatically in subsequent requests (browser handles this)',
        step4: 'Include X-CSRF-Token header in all POST/PUT/DELETE requests',
        note: 'For programmatic access, store the cookie and CSRF token from login response'
      },
      examples: {
        curl_login: `curl -X POST http://localhost:7171/login \\
  -H "Content-Type: application/json" \\
  -c cookies.txt \\
  -d '{"identifier":"dixavado","password":"Sahali1@"}'`,
        curl_get_products: `curl -X GET http://localhost:7171/api/v1/tenant/products \\
  -b cookies.txt \\
  -H "X-CSRF-Token: <token-from-login-response>"`,
        curl_create_product: `curl -X POST http://localhost:7171/api/v1/tenant/products \\
  -b cookies.txt \\
  -H "Content-Type: application/json" \\
  -H "X-CSRF-Token: <token>" \\
  -d '{"name":"Produto X","description":"Desc","price":99.90,"slug":"produto-x"}'`
      }
    }
  });
};

/**
 * Root endpoint handler - Returns API info and available endpoints
 */
export const rootHandler = (req, res) => {
  res.json({
    service: 'DiixWhatsApp API',
    version: '1.0.0',
    description: 'Backend API for multi-tenant WhatsApp business management',
    documentation: 'GET /api-docs for complete OpenAPI 3.0 specification',
    baseUrl: config.apiUrl || 'http://localhost:7171',
    apiVersion: '/api/v1',
    endpoints: {
      public: {
        health: 'GET /health',
        healthDb: 'GET /health/db',
        apiDocs: 'GET /api-docs'
      },
      authentication: {
        loginStatus: 'GET /login',
        login: 'POST /login',
        logout: 'POST /logout'
      },
      admin: {
        baseUrl: '/api/v1/admin',
        dashboard: 'GET /api/v1/admin/dashboard',
        tenants: {
          list: 'GET /api/v1/admin/tenants',
          create: 'POST /api/v1/admin/tenants',
          get: 'GET /api/v1/admin/tenants/:id',
          update: 'POST /api/v1/admin/tenants/:id',
          toggle: 'POST /api/v1/admin/tenants/:id/toggle',
          delete: 'POST /api/v1/admin/tenants/:id/delete'
        },
        users: {
          list: 'GET /api/v1/admin/users',
          create: 'POST /api/v1/admin/users',
          get: 'GET /api/v1/admin/users/:id',
          update: 'POST /api/v1/admin/users/:id',
          delete: 'POST /api/v1/admin/users/:id/delete'
        }
      },
      tenant: {
        baseUrl: '/api/v1/tenant',
        dashboard: 'GET /api/v1/tenant/dashboard',
        products: {
          list: 'GET /api/v1/tenant/products',
          create: 'POST /api/v1/tenant/products',
          get: 'GET /api/v1/tenant/products/:id',
          update: 'POST /api/v1/tenant/products/:id',
          delete: 'POST /api/v1/tenant/products/:id/delete'
        },
        clients: {
          list: 'GET /api/v1/tenant/clients',
          create: 'POST /api/v1/tenant/clients',
          get: 'GET /api/v1/tenant/clients/:id',
          update: 'POST /api/v1/tenant/clients/:id',
          delete: 'POST /api/v1/tenant/clients/:id/delete'
        },
        services: {
          list: 'GET /api/v1/tenant/services',
          create: 'POST /api/v1/tenant/services',
          get: 'GET /api/v1/tenant/services/:id',
          update: 'POST /api/v1/tenant/services/:id',
          delete: 'POST /api/v1/tenant/services/:id/delete'
        },
        promotions: {
          list: 'GET /api/v1/tenant/promotions',
          create: 'POST /api/v1/tenant/promotions',
          get: 'GET /api/v1/tenant/promotions/:id',
          update: 'POST /api/v1/tenant/promotions/:id',
          delete: 'POST /api/v1/tenant/promotions/:id/delete'
        }
      }
    },
    quickStart: {
      step1: 'POST /login with { identifier: "username", password: "password" }',
      step2: 'Save the session cookie (diixwhatsapp.sid) and X-CSRF-Token from response headers',
      step3: 'Include cookie and X-CSRF-Token header in all subsequent requests',
      example: 'curl -X POST http://localhost:7171/login -H "Content-Type: application/json" -d \'{"identifier":"admin","password":"secret"}\''
    }
  });
};
