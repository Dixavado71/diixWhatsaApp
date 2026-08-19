# ETAPA 2 — ARQUITETURA-ALVO E PLANO DE MIGRAÇÃO

## DIAGNÓSTICO DO PROJETO ATUAL

### Estrutura Atual
```
src/
├── app.js (491 linhas) - MONÓLITO PRINCIPAL
├── server.js
├── config/
│   ├── env.js
│   ├── database.js
│   └── session.js
├── controllers/
│   ├── adminController.js (385 linhas) - MONÓLITO
│   ├── authController.js (178 linhas)
│   └── tenantController.js (835 linhas) - MONÓLITO CRÍTICO
├── middleware/
│   ├── auth.js
│   ├── errorHandler.js
│   ├── rateLimiter.js
│   └── tenantIsolation.js
├── repositories/ (acesso direto ao Prisma)
│   ├── auditLogRepository.js
│   ├── clientRepository.js
│   ├── productRepository.js
│   ├── promotionRepository.js
│   ├── serviceRepository.js
│   ├── tenantRepository.js
│   └── userRepository.js
├── routes/
│   ├── admin.js
│   ├── auth.js
│   └── tenant.js
├── services/
│   ├── authService.js
│   └── tenantService.js
├── validators/
├── utils/
├── modules/ (pastas vazias criadas anteriormente)
│   ├── auth/
│   ├── tenants/
│   ├── products/
│   ├── clients/
│   ├── promotions/
│   └── services-module/
├── infrastructure/
│   └── database/
└── shared/
    ├── constants/
    ├── errors/
    └── helpers/
```

### Problemas Identificados

1. **Arquivos Monolíticos:**
   - `tenantController.js` (835 linhas): Mistura 6 domínios diferentes (products, clients, services, promotions, users, tenants)
   - `app.js` (491 linhas): Configuração, middlewares, rotas e documentação misturados
   - `adminController.js` (385 linhas): Mistura tenants, users e dashboard

2. **Responsabilidades Misturadas:**
   - Controllers fazem validação, regras de negócio e acesso a banco
   - Repositórios importam Prisma diretamente sem camada de infraestrutura
   - Middlewares dependem de repositórios diretamente

3. **Código Duplicado:**
   - Validação de tenant repetida em múltiplos repositórios
   - Lógica de slug generation em vários lugares
   - Tratamento de erros similar em todos controllers

4. **Acoplamento Excessivo:**
   - Controllers importam múltiplos repositórios diretamente
   - Não há separação clara entre domínios
   - Modules pastas estão vazias (estrutura não utilizada)

5. **Falta de Camadas:**
   - Não há use cases / casos de uso
   - Services são mínimos e apenas repassam chamadas
   - Não há interfaces/contratos definidos

---

## ARQUITETURA-ALVO PROPOSTA

```
src/
├── app.js (apenas montagem da aplicação)
├── server.js (inicialização HTTP)
│
├── config/
│   ├── env.js (configuração centralizada)
│   ├── database.js (prisma client)
│   ├── logger.js
│   └── index.js
│
├── infrastructure/
│   ├── database/
│   │   ├── prismaClient.js (instância única do Prisma)
│   │   └── transaction.js
│   └── http/
│
├── modules/
│   ├── auth/
│   │   ├── controllers/
│   │   │   └── authController.js
│   │   ├── services/
│   │   │   └── authService.js
│   │   ├── repositories/
│   │   │   └── authRepository.js
│   │   ├── validators/
│   │   │   └── authValidator.js
│   │   ├── routes/
│   │   │   └── authRoutes.js
│   │   └── index.js (API pública do módulo)
│   │
│   ├── tenants/
│   │   ├── controllers/
│   │   │   └── tenantController.js
│   │   ├── services/
│   │   │   └── tenantService.js
│   │   ├── repositories/
│   │   │   └── tenantRepository.js
│   │   ├── validators/
│   │   │   └── tenantValidator.js
│   │   ├── routes/
│   │   │   └── tenantRoutes.js
│   │   └── index.js
│   │
│   ├── products/
│   │   ├── controllers/
│   │   │   └── productController.js
│   │   ├── services/
│   │   │   └── productService.js
│   │   ├── repositories/
│   │   │   └── productRepository.js
│   │   ├── validators/
│   │   │   └── productValidator.js
│   │   ├── routes/
│   │   │   └── productRoutes.js
│   │   └── index.js
│   │
│   ├── clients/
│   │   ├── controllers/
│   │   │   └── clientController.js
│   │   ├── services/
│   │   │   └── clientService.js
│   │   ├── repositories/
│   │   │   └── clientRepository.js
│   │   ├── validators/
│   │   │   └── clientValidator.js
│   │   ├── routes/
│   │   │   └── clientRoutes.js
│   │   └── index.js
│   │
│   ├── servicesModule/
│   │   ├── controllers/
│   │   │   └── serviceController.js
│   │   ├── services/
│   │   │   └── serviceService.js
│   │   ├── repositories/
│   │   │   └── serviceRepository.js
│   │   ├── validators/
│   │   │   └── serviceValidator.js
│   │   ├── routes/
│   │   │   └── serviceRoutes.js
│   │   └── index.js
│   │
│   ├── promotions/
│   │   ├── controllers/
│   │   │   └── promotionController.js
│   │   ├── services/
│   │   │   └── promotionService.js
│   │   ├── repositories/
│   │   │   └── promotionRepository.js
│   │   ├── validators/
│   │   │   └── promotionValidator.js
│   │   ├── routes/
│   │   │   └── promotionRoutes.js
│   │   └── index.js
│   │
│   └── users/
│       ├── controllers/
│       │   └── userController.js
│       ├── services/
│       │   └── userService.js
│       ├── repositories/
│       │   └── userRepository.js
│       ├── validators/
│       │   └── userValidator.js
│       ├── routes/
│       │   └── userRoutes.js
│       └── index.js
│
├── shared/
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── tenantIsolation.js
│   │   ├── validation.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   ├── errors/
│   │   ├── AppError.js
│   │   ├── ValidationError.js
│   │   ├── NotFoundError.js
│   │   └── UnauthorizedError.js
│   ├── helpers/
│   │   ├── slug.js
│   │   ├── password.js
│   │   └── tenantContext.js
│   ├── constants/
│   │   └── roles.js
│   └── utils/
│       └── response.js
│
└── routes/
    └── index.js (agregador de rotas)
```

---

## MAPA DE MIGRAÇÃO

### Fase 1: Infraestrutura e Configuração
| Arquivo Atual | Nova Localização | Ação |
|--------------|------------------|------|
| `src/config/env.js` | `src/config/env.js` | Manter + melhorar validação |
| `src/config/database.js` | `src/infrastructure/database/prismaClient.js` | Mover + renomear |
| `src/config/session.js` | `src/config/session.js` | Manter |

### Fase 2: Shared (Utilitários Compartilhados)
| Arquivo Atual | Nova Localização | Ação |
|--------------|------------------|------|
| `src/utils/slug.js` | `src/shared/helpers/slug.js` | Mover |
| `src/utils/password.js` | `src/shared/helpers/password.js` | Mover |
| `src/utils/response.js` | `src/shared/utils/response.js` | Mover |
| `src/utils/logger.js` | `src/config/logger.js` | Mover + integrar |
| `src/middleware/*` | `src/shared/middleware/*` | Mover |

### Fase 3: Módulo Auth
| Arquivo Atual | Nova Localização | Ação |
|--------------|------------------|------|
| `src/controllers/authController.js` | `src/modules/auth/controllers/authController.js` | Mover + refatorar |
| `src/services/authService.js` | `src/modules/auth/services/authService.js` | Mover |
| `src/validators/authValidator.js` | `src/modules/auth/validators/authValidator.js` | Mover |
| `src/routes/auth.js` | `src/modules/auth/routes/authRoutes.js` | Mover + renomear |
| `src/repositories/userRepository.js` | `src/modules/users/repositories/userRepository.js` | Mover para users |

### Fase 4: Módulo Tenants
| Arquivo Atual | Nova Localização | Ação |
|--------------|------------------|------|
| `src/services/tenantService.js` | `src/modules/tenants/services/tenantService.js` | Mover |
| `src/repositories/tenantRepository.js` | `src/modules/tenants/repositories/tenantRepository.js` | Mover |
| `src/validators/tenantValidator.js` | `src/modules/tenants/validators/tenantValidator.js` | Mover |
| `src/routes/tenant.js` | `src/modules/tenants/routes/tenantRoutes.js` | Mover + renomear |

### Fase 5: Divisão do tenantController.js (MONÓLITO)
O arquivo `tenantController.js` será dividido em 6 controllers separados:

| Responsabilidade | Novo Controller | Localização |
|-----------------|-----------------|-------------|
| Products | `productController.js` | `src/modules/products/controllers/` |
| Clients | `clientController.js` | `src/modules/clients/controllers/` |
| Services | `serviceController.js` | `src/modules/servicesModule/controllers/` |
| Promotions | `promotionController.js` | `src/modules/promotions/controllers/` |
| Users (tenant) | `userController.js` | `src/modules/users/controllers/` |
| Dashboard | `tenantDashboardController.js` | `src/modules/tenants/controllers/` |

### Fase 6: Módulos de Domínio
| Domínio | Repositório | Service | Controller | Routes |
|---------|-------------|---------|------------|--------|
| Products | `modules/products/repositories/` | `modules/products/services/` | `modules/products/controllers/` | `modules/products/routes/` |
| Clients | `modules/clients/repositories/` | `modules/clients/services/` | `modules/clients/controllers/` | `modules/clients/routes/` |
| Services | `modules/servicesModule/repositories/` | `modules/servicesModule/services/` | `modules/servicesModule/controllers/` | `modules/servicesModule/routes/` |
| Promotions | `modules/promotions/repositories/` | `modules/promotions/services/` | `modules/promotions/controllers/` | `modules/promotions/routes/` |

### Fase 7: Admin Controller
| Arquivo Atual | Ação |
|--------------|------|
| `src/controllers/adminController.js` | Dividir em: tenant management (módulo tenants) + user management (módulo users) + dashboard |

### Fase 8: App.js Refatoração
O `app.js` atual (491 linhas) será dividido em:
- `src/app.js` (~50 linhas): Apenas montagem do Express
- `src/config/middlewares.js`: Registro de middlewares
- `src/routes/index.js`: Agregador de rotas
- `src/config/security.js`: Configurações de segurança (CSRF, CORS, Helmet)

### Fase 9: Repositórios
Os repositórios atuais serão movidos para seus respectivos módulos:
- Cada repositório receberá o Prisma via injeção de dependência
- Padronização da interface dos repositórios
- Centralização do tenant isolation

---

## ORDEM DE EXECUÇÃO

1. ✅ **Configuração e Infraestrutura**
   - Centralizar configuração do Prisma
   - Criar estrutura de shared/

2. **Módulo Auth** (já tem estrutura de pastas)
   - Mover arquivos existentes
   - Criar index.js do módulo

3. **Módulo Tenants**
   - Mover service, repository, validator
   - Criar controller de dashboard

4. **Divisão do tenantController.js**
   - Extrair products → modules/products
   - Extrair clients → modules/clients
   - Extrair services → modules/servicesModule
   - Extrair promotions → modules/promotions
   - Extrair users → modules/users

5. **Módulo Users**
   - Mover userRepository
   - Criar userService, userController

6. **Admin Controller**
   - Refatorar para usar módulos
   - Separar responsabilidades

7. **App.js**
   - Dividir em arquivos menores
   - Centralizar configuração de middlewares

8. **Rotas**
   - Atualizar imports
   - Criar agregador principal

9. **Testes**
   - Executar testes existentes
   - Ajustar imports quebrados

---

## CRITÉRIOS DE ACEITE

- [ ] `tenantController.js` original removido
- [ ] `app.js` com menos de 100 linhas
- [ ] Cada módulo com index.js exportando API pública
- [ ] Nenhum controller com mais de 200 linhas
- [ ] Prisma importado apenas em `infrastructure/database/prismaClient.js`
- [ ] `process.env` acessado apenas em `config/env.js`
- [ ] Todos os testes passando
- [ ] Sem imports circulares
- [ ] Tenant isolation preservado e centralizado

---

## RISCOS E MITIGAÇÕES

| Risco | Mitigação |
|-------|-----------|
| Imports quebrados durante migração | Manter compatibilidade até conclusão de cada fase |
| Perda de funcionalidade de tenant isolation | Criar helpers centralizados antes de mover repositórios |
| Testes falhando | Executar testes após cada fase crítica |
| Dependências circulares entre módulos | Definir claramente dependências permitidas |

---

## PRÓXIMOS PASSOS

1. Criar estrutura de infraestrutura/database
2. Mover utilitários para shared/
3. Começar migração do módulo auth
4. Dividir tenantController.js
