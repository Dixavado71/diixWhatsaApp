# DiixWhatsApp - Documentação Geral

## Visão do Projeto

**Empresa:** Diix Solutions  
**Projeto:** DiixWhatsApp  
**Criador:** Dixavado  
**Versão:** 1.0.0  

O DiixWhatsApp é um sistema web administrativo **multi-tenant** desenvolvido para gerenciar múltiplas lojas de forma isolada e segura.

---

## Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    DiixWhatsApp                             │
└──────────────────────┬──────────────────────────────────────┘
                       │
              ┌────────▼────────┐
              │   Autenticação  │
              │    (Session)    │
              └────────┬────────┘
                       │
       ┌───────────────┴───────────────┐
       │                               │
┌──────▼──────┐                 ┌──────▼──────┐
│   MASTER    │                 │   TENANT    │
│ (Admin Global)│               │  (Loja)     │
└──────┬──────┘                 └──────┬──────┘
       │                               │
┌──────▼──────────┐           ┌────────▼────────┐
│ Dashboard Admin │           │  Dashboard Loja │
│ CRUD Tenants    │           │  Produtos       │
│ CRUD Usuários   │           │  Clientes       │
│ Stats Globais   │           │  Serviços       │
│ Acesso Global   │           │  Promoções      │
└─────────────────┘           │  Usuários Loja  │
                              └─────────────────┘
```

---

## Stack Tecnológico

| Categoria | Tecnologia |
|-----------|------------|
| Runtime | Node.js LTS (ESM) |
| Framework Web | Express.js |
| Banco de Dados | PostgreSQL |
| ORM | Prisma |
| Template Engine | EJS |
| Autenticação | express-session + bcrypt |
| Validação | Zod |
| Segurança | Helmet, CSRF, Rate Limiting |
| Logs | Pino |
| CSS | CSS3 Vanilla |
| JS Frontend | Vanilla JavaScript |

---

## Estrutura de Diretórios

```
diixwhatsapp/
├── src/
│   ├── app.js                 # Configuração principal do Express
│   ├── server.js              # Entry point do servidor
│   ├── config/                # Configurações (env, database, session)
│   ├── controllers/           # Controladores de rotas
│   ├── middleware/            # Middlewares (auth, roles, errorHandler)
│   ├── routes/                # Definição de rotas
│   ├── services/              # Regras de negócio
│   ├── repositories/          # Acesso ao banco de dados
│   ├── validators/            # Validações com Zod
│   └── utils/                 # Utilitários (logger, password, slug)
├── views/                     # Templates EJS
│   ├── layouts/
│   ├── partials/
│   ├── auth/
│   ├── admin/
│   ├── tenant/
│   └── errors/
├── public/                    # Arquivos estáticos
│   ├── css/
│   ├── js/
│   └── img/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.js                # Seed inicial
├── tests/                     # Testes automatizados
├── docs/                      # Documentação
├── .env.example               # Exemplo de variáveis de ambiente
├── .gitignore
├── package.json
├── Dockerfile
└── README.md
```

---

## Roles e Permissões

### MASTER
- Acesso global ao sistema
- CRUD completo de Tenants
- CRUD completo de Usuários
- Visualização de estatísticas globais
- Acesso a dados de qualquer Tenant
- Dashboard administrativo global

### TENANT_ADMIN
- Acesso restrito ao próprio Tenant
- CRUD de Produtos, Clientes, Serviços, Promoções
- Gerenciamento de usuários da própria loja
- Edição de configurações da loja
- Dashboard da loja

### TENANT_USER
- Acesso operacional ao próprio Tenant
- Visualização de dados da loja
- Operações limitadas conforme configuração
- Sem acesso a configurações administrativas

---

## Multi-Tenancy

O sistema implementa **isolamento rigoroso** de dados entre Tenants:

1. **Todas as entidades possuem `tenantId`** (exceto User MASTER)
2. **O `tenantId` é obtido da sessão**, nunca do cliente
3. **Todas as consultas filtram por `tenantId`** automaticamente
4. **Middleware de isolamento** previne acesso cruzado

### Exemplo de Isolamento

```javascript
// CORRETO ✅
const product = await prisma.product.findFirst({
  where: {
    id: productId,
    tenantId: req.user.tenantId  // Da sessão
  }
});

// ERRADO ❌
const product = await prisma.product.findUnique({
  where: { id: productId }  // Sem filtro de tenant!
});
```

---

## Segurança Implementada

| Recurso | Descrição |
|---------|-----------|
| Hash de Senhas | bcrypt com salt rounds = 12 |
| Sessões Seguras | HTTPOnly, SameSite=Lax, Secure em produção |
| CSRF Protection | Token CSRF em todos os formulários POST |
| Rate Limiting | Limite de requisições por IP |
| Helmet | Headers de segurança HTTP |
| Validação | Zod em todos os inputs |
| Isolamento Tenant | Filtro obrigatório por tenantId |
| Logs Seguros | Sem registro de senhas ou secrets |
| Graceful Shutdown | Fechamento adequado de conexões |

---

## Entidades do Banco de Dados

### Tenant
- id, name, slug, description, email, phone, document
- address, city, state, zipCode, logo, active
- timestamps

### User
- id, tenantId (nullable), username, email, passwordHash
- name, role, active, lastLoginAt, timestamps

### Product
- id, tenantId, name, slug, description, sku
- price, costPrice, stock, image, active, timestamps

### Client
- id, tenantId, name, email, phone, document
- address, city, state, zipCode, notes, active, timestamps

### Service
- id, tenantId, name, description, price, duration, active, timestamps

### Promotion
- id, tenantId, name, description, discountType, discountValue
- startDate, endDate, active, timestamps

### AuditLog
- id, userId, tenantId, action, entity, entityId
- ip, userAgent, createdAt

---

## Rotas Principais

### Públicas
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/` | Redireciona baseado no login |
| GET | `/login` | Página de login geral |
| POST | `/login` | Processa login |
| POST | `/logout` | Logout |
| GET | `/health` | Health check |
| GET | `/health/db` | Health check do banco |

### Admin (MASTER)
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/admin/login` | Login admin |
| GET | `/admin/dashboard` | Dashboard global |
| GET/POST | `/admin/tenants` | Listar/criar tenants |
| GET/POST | `/admin/tenants/new` | Novo tenant |
| GET/POST | `/admin/tenants/:id/edit` | Editar tenant |
| POST | `/admin/tenants/:id/delete` | Excluir tenant |
| POST | `/admin/tenants/:id/toggle` | Ativar/desativar |
| GET/POST | `/admin/users` | Gerenciar usuários |

### Tenant
| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/tenant/login` | Login tenant |
| GET | `/tenant/dashboard` | Dashboard da loja |
| CRUD | `/tenant/products` | Produtos |
| CRUD | `/tenant/clients` | Clientes |
| CRUD | `/tenant/services` | Serviços |
| CRUD | `/tenant/promotions` | Promoções |
| CRUD | `/tenant/users` | Usuários da loja |

---

## Variáveis de Ambiente

```env
NODE_ENV=development
PORT=7171

DATABASE_URL="postgresql://user:password@host:5432/database"

SESSION_SECRET="mude-este-segredo-em-producao"

MASTER_USERNAME="dixavado"
MASTER_PASSWORD="ALTERAR_SENHA"
MASTER_EMAIL="admin@diixsolutions.local"

LOG_LEVEL=info
```

---

## Comandos Disponíveis

```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Banco de dados
npm run db:generate   # Gerar Prisma Client
npm run db:migrate    # Criar migrations
npm run db:deploy     # Deploy de migrations
npm run db:seed       # Executar seed
npm run db:studio     # Prisma Studio

# Testes
npm test
```

---

## Credenciais de Demonstração (Seed)

| Usuário | Username | Senha | Role |
|---------|----------|-------|------|
| Master | dixavado | (definida no .env) | MASTER |
| Admin Loja A | admin-loja-a | senha123 | TENANT_ADMIN |
| Admin Loja B | admin-loja-b | senha123 | TENANT_ADMIN |
| Usuário Loja A | usuario-loja-a | senha123 | TENANT_USER |

---

## Próximos Passos (Fase 2)

Funcionalidades planejadas para versões futuras:

- [ ] Integração com Evolution API
- [ ] Envio de mensagens WhatsApp
- [ ] Sistema de pedidos
- [ ] Carrinho de compras
- [ ] Checkout e pagamentos (PIX)
- [ ] Gestão de estoque avançada
- [ ] Módulo financeiro
- [ ] Relatórios e analytics
- [ ] Notificações em tempo real
- [ ] CRM integrado
- [ ] Automação de marketing

---

## Suporte

**Diix Solutions**  
Desenvolvido por Dixavado

Para dúvidas e suporte, consulte o README.md principal.
