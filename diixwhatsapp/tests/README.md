# Guia de Testes - DiixWhatsApp

Este documento descreve como executar e manter os testes do projeto DiixWhatsApp.

## 📋 Visão Geral

O projeto utiliza o **native test runner do Node.js** (`node:test`) para execução de testes, proporcionando uma experiência leve e sem dependências extras.

## 🗂️ Estrutura de Testes

```
tests/
├── helpers.js                 # Funções utilitárias compartilhadas
├── isolation.test.js          # Testes de isolamento multi-tenant
├── integration/
│   └── api.test.js           # Testes de integração da API REST
└── unit/
    ├── repositories.test.js  # Testes unitários dos repositórios
    └── validators.test.js    # Testes de validação com Zod
```

## 🚀 Executando os Testes

### Todos os Testes

```bash
npm test
```

### Testes Específicos

#### Testes de Isolamento Multi-Tenant
```bash
node --test tests/isolation.test.js
```

#### Testes de Integração da API
```bash
node --test tests/integration/api.test.js
```

#### Testes Unitários de Repositórios
```bash
node --test tests/unit/repositories.test.js
```

#### Testes de Validação Zod
```bash
node --test tests/unit/validators.test.js
```

### Com Watch Mode (Reexecuta automaticamente)

```bash
nodemon --exec "node --test" tests/**/*.test.js
```

### Com Coverage (Relatório de Cobertura)

```bash
node --test --experimental-test-coverage
```

### Filtrar Testes por Nome

```bash
node --test --test-name-pattern="DEVE criar"
```

## 📝 Tipos de Testes

### 1. Testes de Isolamento Multi-Tenant (`isolation.test.js`)

Garantem que dados de diferentes tenants nunca se misturem:

- ✅ Tenant A não acessa produtos do Tenant B
- ✅ Tenant B não acessa clientes do Tenant A
- ✅ Updates e deletes respeitam o tenantId
- ✅ Contagens são isoladas por tenant

### 2. Testes de Integração da API (`integration/api.test.js`)

Testam os endpoints HTTP completos:

- **Endpoints Públicos:**
  - `GET /health` - Health check
  - `GET /` - Informações da API
  - `GET /api-docs` - Documentação

- **Autenticação:**
  - `POST /login` - Login com credenciais válidas/inválidas
  - Proteção de rotas autenticadas

- **CRUD Completo:**
  - Clientes (criar, buscar, atualizar, listar, deletar)
  - Produtos (criar, buscar, atualizar, listar, deletar)
  - Serviços (criar, atualizar, deletar)
  - Promoções (criar, atualizar, filtrar, deletar)

### 3. Testes Unitários de Repositórios (`unit/repositories.test.js`)

Testam a camada de acesso a dados isoladamente:

- **TenantRepository:** CRUD completo, filtros por status
- **UserRepository:** CRUD, autenticação de senha, filtros por role
- **ClientRepository:** CRUD, filtros por tenant e status
- **ProductRepository:** CRUD, controle de estoque, filtros
- **ServiceRepository:** CRUD, filtros por status
- **PromotionRepository:** CRUD, tipos de desconto, datas de vigência

### 4. Testes de Validação Zod (`unit/validators.test.js`)

Validam os schemas de entrada de dados:

- **Login Schema:** Email e senha
- **Tenant Schema:** Nome, slug, email
- **User Schema:** Username, role, dados pessoais
- **Product Schema:** Preço, estoque, slug
- **Client Schema:** Nome, email, telefone
- **Service Schema:** Nome, descrição, preço
- **Promotion Schema:** Tipo de desconto, valor, datas

## 🔧 Helpers de Teste

O arquivo `tests/helpers.js` fornece funções utilitárias:

```javascript
import { 
  prisma,
  createTestTenant,
  createTestUser,
  createTestClient,
  createTestProduct,
  createTestService,
  createTestPromotion,
  cleanupTestData,
  mockSession,
  sleep
} from './helpers.js';
```

### Exemplo de Uso

```javascript
import { createTestTenant, cleanupTestData } from './helpers.js';

describe('Meu Teste', () => {
  let tenant;
  
  before(async () => {
    tenant = await createTestTenant({ name: 'Tenant Personalizado' });
  });
  
  after(async () => {
    await cleanupTestData({ tenants: [tenant] });
  });
  
  it('deve fazer algo', async () => {
    // Seu teste aqui
  });
});
```

## 🎯 Boas Práticas

### 1. Setup e Cleanup

Sempre limpe os dados após os testes:

```javascript
before(async () => {
  // Criar dados de teste
});

after(async () => {
  // Remover dados de teste
});
```

### 2. Nomes Descritivos

Use nomes que descrevem o comportamento esperado:

```javascript
// ✅ Bom
it('DEVE retornar 401 para usuário não autenticado');

// ❌ Ruim
it('teste de login');
```

### 3. Testes Independentes

Cada teste deve ser independente e poder rodar isoladamente:

```javascript
// ✅ Bom - Cada teste cria seus próprios dados
it('DEVE criar cliente', async () => {
  const client = await createTestClient(tenantId);
  // ...
});

// ❌ Ruim - Depende de teste anterior
it('DEVE atualizar cliente', async () => {
  // Usa client criado em outro teste
});
```

### 4. Mensagens de Erro Claras

```javascript
assert.strictEqual(result, expected, 
  'Resultado deve ser igual ao esperado quando...');
```

## 📊 CI/CD - GitHub Actions

### Workflow Sugerido (`.github/workflows/test.yml`)

```yaml
name: Tests

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
          POSTGRES_DB: diixwhatsapp_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Generate Prisma Client
        run: npm run db:generate
      
      - name: Run migrations
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/diixwhatsapp_test
        run: npm run db:migrate
      
      - name: Run tests
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/diixwhatsapp_test
          JWT_SECRET: test-secret
          SESSION_SECRET: test-session-secret
        run: npm test
      
      - name: Run tests with coverage
        env:
          DATABASE_URL: postgresql://test:test@localhost:5432/diixwhatsapp_test
        run: node --test --experimental-test-coverage
```

## 🔍 Debugging

### Verbose Output

```bash
node --test --test-reporter=spec
```

### Teste Único com Log

```bash
node --test --test-name-pattern="nome do teste" tests/isolation.test.js
```

### Inspecionar Variáveis

Adicione `console.log()` nos testes:

```javascript
it('DEVE criar tenant', async () => {
  const tenant = await createTestTenant();
  console.log('Tenant criado:', tenant);
  assert.ok(tenant.id);
});
```

## ⚠️ Considerações Importantes

### Banco de Dados de Teste

**NUNCA** rode testes em produção. Use um banco dedicado:

```bash
# .env.test
DATABASE_URL=postgresql://user:pass@localhost:5432/diixwhatsapp_test
```

### Transações

Para testes mais rápidos e isolados, considere usar transações:

```javascript
import { prisma } from '../helpers.js';

it('DEVE testar algo', async () => {
  await prisma.$transaction(async (tx) => {
    // Teste dentro de transação (rollback automático)
  });
});
```

### Timeout

Testes de integração podem precisar de mais tempo:

```javascript
it('DEVE processar algo demorado', { timeout: 10000 }, async () => {
  // Teste que pode levar até 10 segundos
});
```

## 📈 Métricas de Qualidade

Execute regularmente:

```bash
# Cobertura de testes
node --test --experimental-test-coverage

# Apenas testes críticos
node --test --test-name-pattern="Isolamento"

# Testes de validação
node --test tests/unit/validators.test.js
```

## 🆘 Solução de Problemas

### Erro: "Cannot find module"

Verifique se as importações estão corretas:

```javascript
// ✅ Correto
import { prisma } from '../helpers.js';

// ❌ Errado
import { prisma } from '../helpers';
```

### Erro: "Prisma Client is not initialized"

Execute:

```bash
npm run db:generate
```

### Testes Falhando Aleatoriamente

Verifique se há dependência entre testes ou limpeza inadequada de dados.

---

**Manutenção:** Atualize este guia sempre que novos testes forem adicionados.
