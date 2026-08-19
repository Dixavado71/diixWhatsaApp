# DiixWhatsApp API Documentation

## Visão Geral

DiixWhatsApp é uma API backend para gerenciamento multi-tenant de negócios WhatsApp. Esta documentação descreve todas as rotas, autenticação, modelos de dados e exemplos de uso para integração com frontends.

---

## Informações Básicas

- **Versão da API**: 1.0.0
- **Base URL**: `http://localhost:3000` (ou variável de ambiente `API_URL`)
- **Formato de Resposta**: JSON
- **Autenticação**: Baseada em sessão com cookies

---

## Autenticação

### Tipo: Session-based

A API utiliza autenticação baseada em sessões. Após o login bem-sucedido, um cookie de sessão é criado e deve ser incluído em todas as requisições subsequentes.

### Login

**Endpoint**: `POST /login`

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "username": "seu_usuario",
  "password": "sua_senha"
}
```

**Resposta de Sucesso (200)**:
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": "uuid-do-usuario",
    "username": "seu_usuario",
    "role": "MASTER ou TENANT_ADMIN ou TENANT_USER",
    "tenantId": "uuid-do-tenant (null para MASTER)"
  },
  "redirect": "/admin/dashboard ou /tenant/dashboard"
}
```

**Resposta de Erro (401)**:
```json
{
  "success": false,
  "error": "Credenciais inválidas"
}
```

### Logout

**Endpoint**: `POST /logout`

**Requer Autenticação**: Sim

**Resposta**:
```json
{
  "success": true,
  "message": "Logout successful",
  "redirect": "/login"
}
```

### Verificar Status de Login

**Endpoint**: `GET /login`

**Resposta (Não Autenticado)**:
```json
{
  "authenticated": false,
  "message": "Please provide credentials to login",
  "endpoint": "POST /login",
  "requiredFields": ["username", "password"]
}
```

**Resposta (Autenticado)**:
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "username": "usuario",
    "role": "MASTER",
    "tenantId": null
  },
  "redirect": "/admin/dashboard"
}
```

---

## Proteção CSRF

Para requisições que alteram estado (POST, PUT, DELETE), é necessário incluir um token CSRF.

**Como obter**: O token é retornado no header `X-CSRF-Token` em qualquer resposta.

**Como enviar**:
- Header: `X-CSRF-Token: <token>`
- Ou no body: `{ "_csrf": "<token>" }`

---

## Endpoints Públicos

### GET /

Retorna informações da API e lista de endpoints.

**Resposta**:
```json
{
  "service": "DiixWhatsApp API",
  "version": "1.0.0",
  "description": "Backend API for multi-tenant WhatsApp business management",
  "endpoints": { ... }
}
```

### GET /health

Health check do serviço.

**Resposta**:
```json
{
  "status": "ok",
  "service": "DiixWhatsApp"
}
```

### GET /health/db

Health check do banco de dados.

**Resposta (Sucesso)**:
```json
{
  "status": "ok",
  "database": "connected"
}
```

**Resposta (Erro)**:
```json
{
  "status": "error",
  "database": "disconnected",
  "error": "mensagem do erro"
}
```

### GET /api-docs

Retorna documentação completa da API em formato JSON.

---

## Endpoints Admin (Requer Role: MASTER)

Todos os endpoints abaixo requerem autenticação com role `MASTER`.

### Dashboard Admin

**GET /admin/dashboard**

Retorna estatísticas do dashboard admin.

**Resposta**:
```json
{
  "stats": {
    "total": 10,
    "active": 8,
    "inactive": 2,
    "totalUsers": 25
  },
  "tenants": [...],
  "recentTenants": [...]
}
```

### Gestão de Tenants

#### Listar Tenants

**GET /admin/tenants**

**Resposta**:
```json
[
  {
    "id": "uuid",
    "name": "Nome da Loja",
    "document": "CNPJ",
    "email": "email@loja.com",
    "phone": "+55...",
    "active": true,
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  }
]
```

#### Criar Tenant

**POST /admin/tenants**

**Body**:
```json
{
  "name": "Nova Loja",
  "document": "00.000.000/0000-00",
  "email": "contato@loja.com",
  "phone": "+55 11 99999-9999",
  "active": true
}
```

**Resposta**: Redirect para `/admin/tenants`

#### Atualizar Tenant

**POST /admin/tenants/:id**

**Body**:
```json
{
  "name": "Nome Atualizado",
  "document": "00.000.000/0000-00",
  "email": "novo@email.com",
  "phone": "+55 11 99999-9999",
  "active": true
}
```

#### Ativar/Desativar Tenant

**POST /admin/tenants/:id/toggle**

#### Deletar Tenant

**POST /admin/tenants/:id/delete**

### Gestão de Usuários (Admin)

#### Listar Usuários

**GET /admin/users**

**Resposta**:
```json
[
  {
    "id": "uuid",
    "username": "usuario",
    "email": "email@example.com",
    "role": "TENANT_ADMIN",
    "tenantId": "uuid-do-tenant",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### Criar Usuário

**POST /admin/users**

**Body**:
```json
{
  "username": "novo_usuario",
  "password": "senha_forte",
  "email": "email@exemplo.com",
  "role": "TENANT_ADMIN",
  "tenantId": "uuid-do-tenant"
}
```

#### Atualizar Usuário

**POST /admin/users/:id**

**Body**:
```json
{
  "username": "usuario_atualizado",
  "email": "novo@email.com",
  "role": "TENANT_USER",
  "tenantId": "uuid-do-tenant"
}
```

#### Deletar Usuário

**POST /admin/users/:id/delete**

---

## Endpoints Tenant (Requer Role: TENANT_ADMIN ou TENANT_USER)

Todos os endpoints abaixo são específicos do tenant autenticado.

### Dashboard Tenant

**GET /tenant/dashboard**

**Resposta**:
```json
{
  "stats": {
    "products": 50,
    "clients": 200,
    "services": 10,
    "promotions": 5,
    "users": 3
  },
  "recentProducts": [...],
  "recentClients": [...]
}
```

### Gestão de Produtos

#### Listar Produtos

**GET /tenant/products**

**Resposta**:
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Produto Exemplo",
    "description": "Descrição do produto",
    "price": 99.90,
    "slug": "produto-exemplo",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### Criar Produto

**POST /tenant/products**

**Body**:
```json
{
  "name": "Novo Produto",
  "description": "Descrição detalhada",
  "price": 99.90,
  "slug": "novo-produto"
}
```

#### Atualizar Produto

**POST /tenant/products/:id**

**Body**:
```json
{
  "name": "Produto Atualizado",
  "description": "Nova descrição",
  "price": 149.90,
  "slug": "produto-atualizado"
}
```

#### Deletar Produto

**POST /tenant/products/:id/delete**

### Gestão de Clientes

#### Listar Clientes

**GET /tenant/clients**

**Resposta**:
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Cliente Exemplo",
    "email": "cliente@email.com",
    "phone": "+55 11 99999-9999",
    "document": "CPF/CNPJ",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### Criar Cliente

**POST /tenant/clients**

**Body**:
```json
{
  "name": "Novo Cliente",
  "email": "cliente@email.com",
  "phone": "+55 11 99999-9999",
  "document": "000.000.000-00"
}
```

#### Atualizar Cliente

**POST /tenant/clients/:id**

#### Deletar Cliente

**POST /tenant/clients/:id/delete**

### Gestão de Serviços

#### Listar Serviços

**GET /tenant/services**

**Resposta**:
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "name": "Serviço Exemplo",
    "description": "Descrição do serviço",
    "price": 199.90,
    "duration": 60,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### Criar Serviço

**POST /tenant/services**

**Body**:
```json
{
  "name": "Novo Serviço",
  "description": "Descrição detalhada",
  "price": 199.90,
  "duration": 60
}
```

#### Atualizar Serviço

**POST /tenant/services/:id**

#### Deletar Serviço

**POST /tenant/services/:id/delete**

### Gestão de Promoções

#### Listar Promoções

**GET /tenant/promotions**

**Resposta**:
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "title": "Promoção de Verão",
    "description": "Desconto especial",
    "discount": 20.00,
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

#### Criar Promoção

**POST /tenant/promotions**

**Body**:
```json
{
  "title": "Nova Promoção",
  "description": "Descrição da promoção",
  "discount": 15.00,
  "startDate": "2024-02-01T00:00:00Z",
  "endDate": "2024-02-28T23:59:59Z"
}
```

#### Atualizar Promoção

**POST /tenant/promotions/:id**

#### Deletar Promoção

**POST /tenant/promotions/:id/delete**

### Gestão de Usuários (Tenant)

#### Listar Usuários do Tenant

**GET /tenant/users**

#### Criar Usuário do Tenant

**POST /tenant/users**

**Body**:
```json
{
  "username": "usuario_tenant",
  "password": "senha_forte",
  "email": "email@tenant.com",
  "role": "TENANT_USER"
}
```

#### Atualizar Usuário do Tenant

**POST /tenant/users/:id**

#### Deletar Usuário do Tenant

**POST /tenant/users/:id/delete**

---

## Modelos de Dados

### Tenant
```typescript
{
  id: string (UUID),
  name: string,
  document: string (CNPJ),
  email: string,
  phone: string,
  active: boolean,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### User
```typescript
{
  id: string (UUID),
  username: string (unique),
  passwordHash: string,
  email: string,
  role: enum (MASTER, TENANT_ADMIN, TENANT_USER),
  tenantId: string (UUID, nullable para MASTER),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Product
```typescript
{
  id: string (UUID),
  tenantId: string (UUID),
  name: string,
  description: string,
  price: Decimal,
  slug: string,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Client
```typescript
{
  id: string (UUID),
  tenantId: string (UUID),
  name: string,
  email: string,
  phone: string,
  document: string (CPF/CNPJ),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Service
```typescript
{
  id: string (UUID),
  tenantId: string (UUID),
  name: string,
  description: string,
  price: Decimal,
  duration: integer (minutos),
  createdAt: DateTime,
  updatedAt: DateTime
}
```

### Promotion
```typescript
{
  id: string (UUID),
  tenantId: string (UUID),
  title: string,
  description: string,
  discount: Decimal,
  startDate: DateTime,
  endDate: DateTime,
  createdAt: DateTime,
  updatedAt: DateTime
}
```

---

## Tratamento de Erros

### Códigos de Status HTTP

| Código | Descrição |
|--------|-----------|
| 200 | OK - Requisição bem-sucedida |
| 400 | Bad Request - Dados de entrada inválidos |
| 401 | Unauthorized - Autenticação necessária |
| 403 | Forbidden - Permissões insuficientes ou CSRF inválido |
| 404 | Not Found - Recurso não existe |
| 500 | Internal Server Error |

### Formato de Erro

```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

---

## Exemplos de Uso

### JavaScript (Fetch API)

```javascript
// Login
const login = async (username, password) => {
  const response = await fetch('http://localhost:3000/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include', // Importante para cookies de sessão
    body: JSON.stringify({ username, password })
  });
  
  const data = await response.json();
  
  if (data.success) {
    // Obter CSRF token do header
    const csrfToken = response.headers.get('X-CSRF-Token');
    localStorage.setItem('csrfToken', csrfToken);
    return data;
  }
  
  throw new Error(data.error);
};

// Listar produtos (exemplo de requisição autenticada)
const getProducts = async () => {
  const response = await fetch('http://localhost:3000/tenant/products', {
    method: 'GET',
    credentials: 'include'
  });
  
  return await response.json();
};

// Criar produto (com CSRF)
const createProduct = async (productData) => {
  const csrfToken = localStorage.getItem('csrfToken');
  
  const response = await fetch('http://localhost:3000/tenant/products', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': csrfToken
    },
    credentials: 'include',
    body: JSON.stringify(productData)
  });
  
  return await response.json();
};
```

### Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true // Importante para cookies
});

// Interceptor para adicionar CSRF token
api.interceptors.request.use(async (config) => {
  if (['POST', 'PUT', 'DELETE'].includes(config.method.toUpperCase())) {
    const csrfToken = localStorage.getItem('csrfToken');
    if (csrfToken) {
      config.headers['X-CSRF-Token'] = csrfToken;
    }
  }
  return config;
});

// Login
const login = async (username, password) => {
  const response = await api.post('/login', { username, password });
  const csrfToken = response.headers['x-csrf-token'];
  localStorage.setItem('csrfToken', csrfToken);
  return response.data;
};
```

---

## Notas Importantes

1. **Sessão**: Todas as requisições devem incluir `credentials: 'include'` (fetch) ou `withCredentials: true` (axios) para manter a sessão.

2. **CSRF**: Tokens CSRF são obrigatórios para operações de escrita. Obtenha o token do header `X-CSRF-Token` em qualquer resposta.

3. **Rate Limiting**: A API possui rate limiting configurado. Requisições excessivas podem resultar em erro 429.

4. **Multi-tenant**: Usuários TENANT só acessam dados do seu próprio tenant automaticamente.

5. **Roles**:
   - `MASTER`: Acesso total ao sistema (admin)
   - `TENANT_ADMIN`: Acesso completo aos dados do tenant
   - `TENANT_USER`: Acesso limitado aos dados do tenant

---

## Suporte

Para mais informações sobre a implementação, consulte o código fonte nos diretórios:
- `/src/routes` - Definição das rotas
- `/src/controllers` - Lógica dos endpoints
- `/src/services` - Regras de negócio
- `/src/repositories` - Acesso ao banco de dados
