# Documentação Completa da API - DiixWhatsApp

## Visão Geral do Projeto

**DiixWhatsApp** é uma API backend multi-tenant para gestão de negócios WhatsApp, construída com Node.js, Express, Prisma ORM e PostgreSQL. O sistema suporta múltiplas lojas (tenants) isoladas, cada uma gerenciando seus próprios produtos, clientes, serviços, promoções e usuários.

### Tecnologias Utilizadas
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js v5
- **ORM**: Prisma v5.22.0
- **Banco de Dados**: PostgreSQL
- **Cache/Sessão**: Redis (connect-redis)
- **Validação**: Zod
- **Segurança**: Helmet, CORS, CSURF, express-rate-limit
- **Logs**: Pino

### Configuração do Ambiente

Variáveis de ambiente necessárias (`.env`):

```bash
NODE_ENV=development|production|test
PORT=7171
DATABASE_URL=postgresql://user:password@localhost:5432/diixwhatsapp
SESSION_SECRET=<string-aleatoria-min-32-caracteres>
MASTER_PASSWORD=<senha-do-admin-master>
MASTER_USERNAME=dixavado
MASTER_EMAIL=admin@diixsolutions.local
REDIS_URL=redis://localhost:6379
FRONTEND_URL=http://localhost:3000
API_URL=http://localhost:7171
LOG_LEVEL=info
```

---

## Estrutura de Rotas da API

Todas as rotas da API estão montadas sob o prefixo `/api/v1/`, permitindo versionamento futuro sem breaking changes.

### Base URL
```
http://localhost:7171/api/v1
```

---

## 1. Rotas Públicas (Autenticação)

### 1.1. Health Checks

#### `GET /health`
Verifica a saúde do serviço, banco de dados e Redis.

**Descrição**: Retorna status geral da aplicação e dependências.

**Resposta de Sucesso (200)**:
```json
{
  "status": "ok",
  "service": "DiixWhatsApp",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "checks": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy" }
  }
}
```

**Resposta de Erro (503)**:
```json
{
  "status": "ok",
  "service": "DiixWhatsApp",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development",
  "checks": {
    "database": { "status": "unhealthy", "error": "..." },
    "redis": { "status": "unhealthy", "error": "..." }
  }
}
```

---

#### `GET /health/db`
Verifica apenas a conexão com o banco de dados.

**Resposta de Sucesso (200)**:
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Resposta de Erro (500)**:
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "mensagem de erro"
}
```

---

### 1.2. Autenticação

#### `GET /auth/login`
Verifica status de autenticação ou solicita credenciais.

**Descrição**: Se já autenticado, retorna informações do usuário. Caso contrário, informa como fazer login.

**Resposta (Não Autenticado)**:
```json
{
  "authenticated": false,
  "message": "Please provide credentials to login",
  "endpoint": "POST /login",
  "requiredFields": ["identifier (username or email)", "password"]
}
```

**Resposta (Autenticado)**:
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "MASTER",
    "tenantId": null
  },
  "redirect": "/admin/dashboard"
}
```

---

#### `POST /auth/login`
Autentica usuário e cria sessão.

**Descrição**: Aceita username ou email no campo `identifier`. Aplica rate limiting para prevenir brute force.

**Body da Requisição**:
```json
{
  "identifier": "admin ou admin@email.com",
  "password": "senha123"
}
```

**Headers**:
```
Content-Type: application/json
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "username": "admin",
    "role": "MASTER",
    "tenantId": null
  },
  "redirect": "/admin/dashboard"
}
```

**Cookie Retornado**: `diixwhatsapp.sid=<session-id>`

**Resposta de Erro (401)**:
```json
{
  "success": false,
  "error": "Credenciais inválidas"
}
```

**Resposta de Erro (400)**:
```json
{
  "success": false,
  "error": "Dados inválidos"
}
```

---

#### `POST /auth/logout`
Destroi sessão do usuário.

**Requer**: Autenticação (cookie de sessão)

**Headers**:
```
Cookie: diixwhatsapp.sid=<session-id>
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Logout successful",
  "redirect": "/login"
}
```

---

#### `GET /auth/admin/login`
Verifica se usuário tem role MASTER.

**Resposta (MASTER)**:
```json
{
  "authenticated": true,
  "user": { ... },
  "redirect": "/admin/dashboard"
}
```

**Resposta (Não MASTER)**:
```json
{
  "authenticated": false,
  "message": "Admin login required",
  "endpoint": "POST /login",
  "requiredRole": "MASTER"
}
```

---

#### `GET /auth/tenant/login`
Verifica se usuário tem role de tenant.

**Resposta (Tenant)**:
```json
{
  "authenticated": true,
  "user": { ... },
  "redirect": "/tenant/dashboard"
}
```

**Resposta (Não Tenant)**:
```json
{
  "authenticated": false,
  "message": "Tenant login required",
  "endpoint": "POST /login",
  "requiredRole": "TENANT"
}
```

---

## 2. Rotas Administrativas (MASTER)

**Prefixo**: `/api/v1/admin`

**Requisitos**: 
- Autenticação obrigatória
- Role: `MASTER`
- Cookie de sessão válido
- CSRF Token (para métodos POST)

### 2.1. Dashboard

#### `GET /admin/dashboard`
Obtém estatísticas e dados do dashboard administrativo.

**Headers**:
```
Authorization: Bearer <token> (se aplicável)
Cookie: diixwhatsapp.sid=<session-id>
X-CSRF-Token: <csrf-token>
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalTenants": 10,
      "activeTenants": 8,
      "totalUsers": 25,
      "totalProducts": 150,
      "totalClients": 500
    },
    "tenants": [...],
    "recentTenants": [...]
  }
}
```

---

### 2.2. Gestão de Tenants (Lojas)

#### `GET /admin/tenants`
Lista todos os tenants cadastrados.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "tenants": [
      {
        "id": "uuid",
        "name": "Loja Exemplo",
        "slug": "loja-exemplo",
        "document": "00.000.000/0000-00",
        "email": "contato@loja.com",
        "phone": "(11) 99999-9999",
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### `GET /admin/tenants/new`
Retorna metadados para criação de novo tenant.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Endpoint pronto. Envie um POST com os dados da nova loja."
}
```

---

#### `POST /admin/tenants`
Cria um novo tenant.

**Body da Requisição**:
```json
{
  "name": "Nova Loja",
  "document": "00.000.000/0000-00",
  "email": "contato@novaloja.com",
  "phone": "(11) 99999-9999",
  "address": "Rua Exemplo, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01000-000",
  "active": true
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Loja criada com sucesso",
  "data": {
    "id": "uuid",
    "name": "Nova Loja",
    "slug": "nova-loja",
    ...
  }
}
```

**Resposta de Erro (400)**:
```json
{
  "success": false,
  "error": "Dados inválidos: nome é obrigatório"
}
```

---

#### `GET /admin/tenants/:id/edit`
Obtém dados de um tenant específico para edição.

**Parâmetros de Rota**:
- `id`: UUID do tenant

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "tenant": {
      "id": "uuid",
      "name": "Loja Exemplo",
      ...
    }
  }
}
```

**Resposta de Erro (404)**:
```json
{
  "success": false,
  "error": "Loja não encontrada"
}
```

---

#### `POST /admin/tenants/:id`
Atualiza um tenant existente.

**Parâmetros de Rota**:
- `id`: UUID do tenant

**Body da Requisição**:
```json
{
  "name": "Nome Atualizado",
  "document": "00.000.000/0000-00",
  "email": "novo@email.com",
  "phone": "(11) 99999-9999",
  "active": true
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Loja atualizada com sucesso"
}
```

---

#### `POST /admin/tenants/:id/toggle`
Alterna status ativo/inativo de um tenant.

**Parâmetros de Rota**:
- `id`: UUID do tenant

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Status da loja atualizado com sucesso"
}
```

---

#### `POST /admin/tenants/:id/delete`
Exclui um tenant.

**Parâmetros de Rota**:
- `id`: UUID do tenant

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Loja excluída com sucesso"
}
```

---

### 2.3. Gestão de Usuários

#### `GET /admin/users`
Lista todos os usuários do sistema.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "username": "usuario1",
        "email": "usuario@email.com",
        "role": "TENANT_ADMIN",
        "tenantId": "uuid-tenant",
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### `GET /admin/users/new`
Retorna metadados para criação de novo usuário.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Endpoint pronto. Envie um POST com os dados do novo usuário."
}
```

---

#### `POST /admin/users`
Cria um novo usuário.

**Body da Requisição**:
```json
{
  "username": "novousuario",
  "email": "novo@email.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "TENANT_ADMIN",
  "tenantId": "uuid-tenant"
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "id": "uuid",
    "username": "novousuario",
    ...
  }
}
```

---

#### `GET /admin/users/:id/edit`
Obtém dados de usuário e tenants ativos para edição.

**Parâmetros de Rota**:
- `id`: UUID do usuário

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "tenants": [ ... ]
  }
}
```

---

#### `POST /admin/users/:id`
Atualiza um usuário existente.

**Parâmetros de Rota**:
- `id`: UUID do usuário

**Body da Requisição**:
```json
{
  "username": "usuario_atualizado",
  "email": "atualizado@email.com",
  "name": "Nome Atualizado",
  "role": "TENANT_USER",
  "tenantId": "uuid-tenant"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso"
}
```

---

#### `POST /admin/users/:id/delete`
Exclui um usuário.

**Parâmetros de Rota**:
- `id`: UUID do usuário

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Usuário excluído com sucesso"
}
```

---

## 3. Rotas de Tenant (Lojas)

**Prefixo**: `/api/v1/tenant`

**Requisitos**:
- Autenticação obrigatória
- Role: `TENANT_ADMIN` ou `TENANT_USER`
- Usuário deve pertencer a um tenant
- Cookie de sessão válido
- CSRF Token (para métodos POST)

### 3.1. Dashboard do Tenant

#### `GET /tenant/dashboard`
Obtém estatísticas do dashboard do tenant.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "stats": {
      "totalProducts": 50,
      "totalClients": 200,
      "totalServices": 15,
      "totalPromotions": 5
    },
    "recentProducts": [...],
    "recentClients": [...]
  }
}
```

---

### 3.2. Gestão de Produtos

**Prefixo**: `/api/v1/tenant/products`

#### `GET /tenant/products/products`
Lista todos os produtos do tenant autenticado.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "tenantId": "uuid-tenant",
        "name": "Produto Exemplo",
        "slug": "produto-exemplo",
        "description": "Descrição do produto",
        "sku": "PROD-001",
        "price": "99.90",
        "costPrice": "50.00",
        "stock": 100,
        "image": "url-da-imagem",
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### `GET /tenant/products/products/new`
Retorna metadados para criação de produto.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Endpoint pronto. Envie um POST com os dados do novo produto."
}
```

---

#### `POST /tenant/products/products`
Cria um novo produto.

**Body da Requisição**:
```json
{
  "name": "Novo Produto",
  "slug": "novo-produto",
  "description": "Descrição detalhada",
  "sku": "PROD-002",
  "price": 149.90,
  "costPrice": 75.00,
  "stock": 50,
  "image": "https://exemplo.com/imagem.jpg",
  "active": true
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Produto criado com sucesso",
  "data": { ... }
}
```

---

#### `GET /tenant/products/products/:id/edit`
Obtém dados de um produto para edição.

**Parâmetros de Rota**:
- `id`: UUID do produto

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "product": { ... }
  }
}
```

---

#### `POST /tenant/products/products/:id`
Atualiza um produto existente.

**Parâmetros de Rota**:
- `id`: UUID do produto

**Body da Requisição**:
```json
{
  "name": "Produto Atualizado",
  "slug": "produto-atualizado",
  "description": "Nova descrição",
  "price": 199.90,
  "stock": 75
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Produto atualizado com sucesso",
  "data": { ... }
}
```

---

#### `POST /tenant/products/products/:id/delete`
Exclui um produto.

**Parâmetros de Rota**:
- `id`: UUID do produto

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Produto excluído com sucesso"
}
```

---

### 3.3. Gestão de Clientes

**Prefixo**: `/api/v1/tenant/clients`

#### `GET /tenant/clients/clients`
Lista todos os clientes do tenant autenticado.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "clients": [
      {
        "id": "uuid",
        "tenantId": "uuid-tenant",
        "name": "Cliente Exemplo",
        "email": "cliente@email.com",
        "phone": "(11) 99999-9999",
        "document": "123.456.789-00",
        "address": "Rua Exemplo, 123",
        "city": "São Paulo",
        "state": "SP",
        "zipCode": "01000-000",
        "notes": "Observações",
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### `GET /tenant/clients/clients/new`
Retorna metadados para criação de cliente.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Endpoint pronto. Envie um POST com os dados do novo cliente."
}
```

---

#### `POST /tenant/clients/clients`
Cria um novo cliente.

**Body da Requisição**:
```json
{
  "name": "Novo Cliente",
  "email": "novo@cliente.com",
  "phone": "(11) 99999-9999",
  "document": "123.456.789-00",
  "address": "Rua Exemplo, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01000-000",
  "notes": "Observações"
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Cliente criado com sucesso",
  "data": { ... }
}
```

---

#### `GET /tenant/clients/clients/:id/edit`
Obtém dados de um cliente para edição.

**Parâmetros de Rota**:
- `id`: UUID do cliente

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "client": { ... }
  }
}
```

---

#### `POST /tenant/clients/clients/:id`
Atualiza um cliente existente.

**Parâmetros de Rota**:
- `id`: UUID do cliente

**Body da Requisição**:
```json
{
  "name": "Cliente Atualizado",
  "email": "atualizado@cliente.com",
  "phone": "(11) 88888-8888",
  "address": "Nova Rua, 456"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Cliente atualizado com sucesso",
  "data": { ... }
}
```

---

#### `POST /tenant/clients/clients/:id/delete`
Exclui um cliente.

**Parâmetros de Rota**:
- `id`: UUID do cliente

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Cliente excluído com sucesso"
}
```

---

### 3.4. Gestão de Serviços

**Prefixo**: `/api/v1/tenant/services`

#### `GET /tenant/services/services`
Lista todos os serviços do tenant autenticado.

**Query Parameters Opcionais**:
- `active=true|false`: Filtra por status ativo

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "services": [
      {
        "id": "uuid",
        "tenantId": "uuid-tenant",
        "name": "Serviço Exemplo",
        "description": "Descrição do serviço",
        "price": "150.00",
        "duration": 60,
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### `GET /tenant/services/services/new`
Retorna metadados para criação de serviço.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Endpoint pronto. Envie um POST com os dados do novo serviço."
}
```

---

#### `POST /tenant/services/services`
Cria um novo serviço.

**Body da Requisição**:
```json
{
  "name": "Novo Serviço",
  "description": "Descrição detalhada",
  "price": 200.00,
  "duration": 90,
  "active": true
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Serviço criado com sucesso",
  "data": { ... }
}
```

---

#### `GET /tenant/services/services/:id/edit`
Obtém dados de um serviço para edição.

**Parâmetros de Rota**:
- `id`: UUID do serviço

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "service": { ... }
  }
}
```

---

#### `POST /tenant/services/services/:id`
Atualiza um serviço existente.

**Parâmetros de Rota**:
- `id`: UUID do serviço

**Body da Requisição**:
```json
{
  "name": "Serviço Atualizado",
  "description": "Nova descrição",
  "price": 250.00,
  "duration": 120
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Serviço atualizado com sucesso",
  "data": { ... }
}
```

---

#### `POST /tenant/services/services/:id/delete`
Exclui um serviço.

**Parâmetros de Rota**:
- `id`: UUID do serviço

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Serviço excluído com sucesso"
}
```

---

### 3.5. Gestão de Promoções

**Prefixo**: `/api/v1/tenant/promotions`

#### `GET /tenant/promotions/promotions`
Lista todas as promoções do tenant autenticado.

**Query Parameters Opcionais**:
- `active=true|false`: Filtra por status ativo

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "promotions": [
      {
        "id": "uuid",
        "tenantId": "uuid-tenant",
        "name": "Promoção Verão",
        "description": "Desconto especial de verão",
        "discountType": "PERCENTAGE",
        "discountValue": "20.00",
        "startDate": "2024-01-01T00:00:00.000Z",
        "endDate": "2024-03-31T23:59:59.000Z",
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

**Tipos de Desconto**:
- `PERCENTAGE`: Porcentagem (ex: 20 = 20%)
- `FIXED`: Valor fixo (ex: 50 = R$ 50,00)

---

#### `GET /tenant/promotions/promotions/new`
Retorna metadados para criação de promoção.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Endpoint pronto. Envie um POST com os dados da nova promoção."
}
```

---

#### `POST /tenant/promotions/promotions`
Cria uma nova promoção.

**Body da Requisição**:
```json
{
  "name": "Black Friday",
  "description": "Super desconto de Black Friday",
  "discountType": "PERCENTAGE",
  "discountValue": 30.00,
  "startDate": "2024-11-29T00:00:00.000Z",
  "endDate": "2024-11-29T23:59:59.000Z",
  "active": true
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Promoção criada com sucesso",
  "data": { ... }
}
```

---

#### `GET /tenant/promotions/promotions/:id/edit`
Obtém dados de uma promoção para edição.

**Parâmetros de Rota**:
- `id`: UUID da promoção

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "promotion": { ... }
  }
}
```

---

#### `POST /tenant/promotions/promotions/:id`
Atualiza uma promoção existente.

**Parâmetros de Rota**:
- `id`: UUID da promoção

**Body da Requisição**:
```json
{
  "name": "Promoção Atualizada",
  "description": "Nova descrição",
  "discountType": "FIXED",
  "discountValue": 50.00,
  "endDate": "2024-12-31T23:59:59.000Z"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Promoção atualizada com sucesso",
  "data": { ... }
}
```

---

#### `POST /tenant/promotions/promotions/:id/delete`
Exclui uma promoção.

**Parâmetros de Rota**:
- `id`: UUID da promoção

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Promoção excluída com sucesso"
}
```

---

### 3.6. Gestão de Usuários do Tenant

**Prefixo**: `/api/v1/admin/users` (gerenciado pelo MASTER) ou `/api/v1/tenant/users`

#### `GET /tenant/users/users`
Lista todos os usuários do tenant autenticado.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid",
        "tenantId": "uuid-tenant",
        "username": "usuario_tenant",
        "email": "usuario@tenant.com",
        "name": "Nome Usuário",
        "role": "TENANT_ADMIN",
        "active": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

---

#### `GET /tenant/users/users/new`
Retorna metadados para criação de usuário.

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Endpoint pronto. Envie um POST com os dados do novo usuário."
}
```

---

#### `POST /tenant/users/users`
Cria um novo usuário para o tenant.

**Body da Requisição**:
```json
{
  "username": "novo_usuario",
  "email": "novo@tenant.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "TENANT_USER"
}
```

**Resposta de Sucesso (201)**:
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": { ... }
}
```

---

#### `GET /tenant/users/users/:id/edit`
Obtém dados de um usuário para edição.

**Parâmetros de Rota**:
- `id`: UUID do usuário

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

---

#### `POST /tenant/users/users/:id`
Atualiza um usuário existente.

**Parâmetros de Rota**:
- `id`: UUID do usuário

**Body da Requisição**:
```json
{
  "username": "usuario_atualizado",
  "email": "atualizado@tenant.com",
  "name": "Nome Atualizado",
  "role": "TENANT_ADMIN"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Usuário atualizado com sucesso"
}
```

---

#### `POST /tenant/users/users/:id/delete`
Exclui um usuário do tenant.

**Parâmetros de Rota**:
- `id`: UUID do usuário

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Usuário excluído com sucesso"
}
```

---

## 4. Modelos de Dados

### Tenant
```json
{
  "id": "string (UUID)",
  "name": "string",
  "slug": "string (unique)",
  "description": "string (nullable)",
  "email": "string (nullable)",
  "phone": "string (nullable)",
  "document": "string (nullable)",
  "address": "string (nullable)",
  "city": "string (nullable)",
  "state": "string (nullable)",
  "zipCode": "string (nullable)",
  "logo": "string (nullable)",
  "active": "boolean",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### User
```json
{
  "id": "string (UUID)",
  "tenantId": "string (UUID, nullable para MASTER)",
  "username": "string (unique)",
  "email": "string (unique)",
  "passwordHash": "string",
  "name": "string (nullable)",
  "role": "enum (MASTER, TENANT_ADMIN, TENANT_USER)",
  "active": "boolean",
  "lastLoginAt": "DateTime (nullable)",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### Product
```json
{
  "id": "string (UUID)",
  "tenantId": "string (UUID)",
  "name": "string",
  "slug": "string",
  "description": "string (nullable)",
  "sku": "string (nullable)",
  "price": "Decimal (10,2)",
  "costPrice": "Decimal (10,2, nullable)",
  "stock": "integer",
  "image": "string (nullable)",
  "active": "boolean",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### Client
```json
{
  "id": "string (UUID)",
  "tenantId": "string (UUID)",
  "name": "string",
  "email": "string (nullable)",
  "phone": "string (nullable)",
  "document": "string (nullable)",
  "address": "string (nullable)",
  "city": "string (nullable)",
  "state": "string (nullable)",
  "zipCode": "string (nullable)",
  "notes": "string (nullable)",
  "active": "boolean",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### Service
```json
{
  "id": "string (UUID)",
  "tenantId": "string (UUID)",
  "name": "string",
  "description": "string (nullable)",
  "price": "Decimal (10,2)",
  "duration": "integer (minutos, nullable)",
  "active": "boolean",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### Promotion
```json
{
  "id": "string (UUID)",
  "tenantId": "string (UUID)",
  "name": "string",
  "description": "string (nullable)",
  "discountType": "enum (PERCENTAGE, FIXED)",
  "discountValue": "Decimal (10,2)",
  "startDate": "DateTime",
  "endDate": "DateTime",
  "active": "boolean",
  "createdAt": "DateTime",
  "updatedAt": "DateTime"
}
```

### AuditLog
```json
{
  "id": "string (UUID)",
  "userId": "string (UUID, nullable)",
  "tenantId": "string (UUID, nullable)",
  "action": "string",
  "entity": "string (nullable)",
  "entityId": "string (nullable)",
  "ip": "string (nullable)",
  "userAgent": "string (nullable)",
  "createdAt": "DateTime"
}
```

---

## 5. Códigos de Erro HTTP

| Código | Descrição | Significado |
|--------|-----------|-------------|
| 200 | OK | Requisição bem-sucedida |
| 201 | Created | Recurso criado com sucesso |
| 400 | Bad Request | Dados de entrada inválidos |
| 401 | Unauthorized | Autenticação necessária |
| 403 | Forbidden | Permissão insuficiente ou CSRF inválido |
| 404 | Not Found | Recurso não existe |
| 500 | Internal Server Error | Erro interno do servidor |
| 503 | Service Unavailable | Serviço indisponível (saúde) |

---

## 6. Segurança

### 6.1. Autenticação
- Baseada em sessão com cookies HTTP-only
- Session ID armazenado no cookie `diixwhatsapp.sid`
- Dados da sessão armazenados no Redis

### 6.2. Autorização
- **MASTER**: Acesso total ao sistema, incluindo gestão de todos os tenants e usuários
- **TENANT_ADMIN**: Gestão completa dentro do seu tenant (produtos, clientes, serviços, promoções, usuários do tenant)
- **TENANT_USER**: Acesso limitado dentro do tenant (somente leitura ou operações específicas)

### 6.3. CSRF Protection
- Token CSRF gerado automaticamente para cada sessão
- Obrigatório para requisições POST, PUT, DELETE
- Token enviado via header `X-CSRF-Token` ou campo `_csrf` no body

### 6.4. Rate Limiting
- Limite geral de requisições por IP
- Limite específico para tentativas de login (prevenir brute force)

### 6.5. Headers de Segurança
- Helmet.js configura headers de segurança
- CORS configurado para origem específica
- Trust proxy habilitado para detecção correta de IP

---

## 7. Exemplos de Consumo

### 7.1. Login com cURL

```bash
# Fazer login
curl -X POST http://localhost:7171/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{
    "identifier": "admin",
    "password": "senha123"
  }'

# Extrair token CSRF do cookie
CSRF_TOKEN=$(grep -o 'XSRF-TOKEN=[^;]*' cookies.txt | cut -d'=' -f2)

# Listar tenants (requer autenticação)
curl -X GET http://localhost:7171/api/v1/admin/tenants \
  -b cookies.txt \
  -H "X-CSRF-Token: $CSRF_TOKEN"
```

### 7.2. Criar Tenant com JavaScript (Fetch)

```javascript
// Login
const loginResponse = await fetch('http://localhost:7171/api/v1/auth/login', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
  body: JSON.stringify({
    identifier: 'admin',
    password: 'senha123'
  })
});

const { csrfToken } = await loginResponse.json();

// Criar tenant
const createTenantResponse = await fetch('http://localhost:7171/api/v1/admin/tenants', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken
  },
  credentials: 'include',
  body: JSON.stringify({
    name: 'Minha Loja',
    document: '00.000.000/0000-00',
    email: 'contato@minhaloja.com',
    phone: '(11) 99999-9999',
    active: true
  })
});

const result = await createTenantResponse.json();
console.log(result);
```

### 7.3. Listar Produtos com Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:7171/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para adicionar token CSRF
api.interceptors.request.use(async (config) => {
  // Obter token CSRF do cookie ou storage
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

// Listar produtos
try {
  const response = await api.get('/tenant/products/products');
  console.log(response.data.data.products);
} catch (error) {
  console.error('Erro:', error.response?.data);
}
```

---

## 8. Comandos Úteis

### Instalação e Setup
```bash
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
```

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

### Testes
```bash
npm test
npm run test:unit
npm run test:integration
npm run test:coverage
```

### Banco de Dados
```bash
npm run db:studio      # Abrir Prisma Studio
npm run db:migrate     # Criar nova migration
npm run db:deploy      # Deploy em produção
npm run db:seed        # Popular banco com dados iniciais
```

---

## 9. Arquitetura do Projeto

```
diixwhatsapp/
├── src/
│   ├── app.js                 # Configuração principal do Express
│   ├── server.js              # Entry point do servidor
│   ├── config/                # Configurações (env, session, etc.)
│   ├── controllers/           # Controllers globais
│   ├── infrastructure/        # Database, cache, external services
│   ├── modules/               # Módulos da aplicação
│   │   ├── admin/             # Módulo administrativo
│   │   ├── clients/           # Módulo de clientes
│   │   ├── products/          # Módulo de produtos
│   │   ├── promotions/        # Módulo de promoções
│   │   ├── services/          # Módulo de serviços
│   │   ├── tenants/           # Módulo de tenants
│   │   └── users/             # Módulo de usuários
│   ├── repositories/          # Camada de acesso a dados
│   ├── routes/                # Rotas principais
│   ├── services/              # Regras de negócio
│   ├── shared/                # Utilitários compartilhados
│   │   ├── controllers/       # Controllers base genéricos
│   │   ├── middleware/        # Middlewares (auth, errorHandler, etc.)
│   │   ├── utils/             # Utilitários diversos
│   │   └── helpers/           # Helpers diversos
│   └── validators/            # Validações com Zod
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── seed.js                # Script de seed inicial
├── tests/                     # Testes automatizados
└── docs/                      # Documentação adicional
```

---

## 10. Fluxo de Trabalho Típico

### Para Administrador MASTER:
1. Fazer login com credenciais MASTER
2. Acessar `/api/v1/admin/dashboard` para visão geral
3. Criar novos tenants conforme necessário
4. Gerenciar usuários globais
5. Monitorar saúde do sistema

### Para Tenant Admin:
1. Fazer login com credenciais do tenant
2. Acessar `/api/v1/tenant/dashboard` para visão geral
3. Cadastrar produtos, clientes, serviços e promoções
4. Gerenciar usuários do próprio tenant
5. Consultar relatórios e estatísticas

---

## 11. Considerações Finais

### Multi-Tenancy
- Cada tenant possui isolamento lógico de dados
- Usuários de um tenant não acessam dados de outros tenants
- MASTER tem visão global de todos os tenants

### Auditoria
- Todas as operações CRUD são registradas em `AuditLog`
- Logs incluem: usuário, tenant, ação, entidade, IP, user agent

### Escalabilidade
- Conexões com banco de dados usando pooling
- Sessões armazenadas no Redis para escalabilidade horizontal
- Cache preparado para implementação futura

### Manutenibilidade
- Código organizado em módulos independentes
- Uso de BaseController para reduzir duplicação
- Validações centralizadas com Zod
- Logs estruturados com Pino

---

**Versão da Documentação**: 1.0.0  
**Última Atualização**: 2024  
**Autor**: Equipe DiixWhatsApp
