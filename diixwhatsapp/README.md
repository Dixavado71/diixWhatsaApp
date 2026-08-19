# DiixWhatsApp - Sistema Administrativo Multi-Tenant

[![Node.js](https://img.shields.io/badge/Node.js-LTS-green.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-blue.svg)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-blue.svg)](https://prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue.svg)](https://postgresql.org/)

## 📋 Descrição

**DiixWhatsApp** é um sistema web administrativo **multi-tenant** desenvolvido pela **Diix Solutions** para gerenciar múltiplas lojas de forma isolada e segura.

### Funcionalidades Principais

- ✅ **Multi-Tenancy**: Isolamento completo de dados entre lojas
- ✅ **RBAC**: Controle de acesso baseado em roles (MASTER, TENANT_ADMIN, TENANT_USER)
- ✅ **Autenticação Segura**: Sessões server-side com bcrypt
- ✅ **CRUD Completo**: Gestão de produtos, clientes, serviços e promoções
- ✅ **Dashboard**: Painéis administrativos globais e por loja
- ✅ **Auditoria**: Log de todas as ações importantes
- ✅ **Segurança**: CSRF, Helmet, Rate Limiting, Validação Zod

---

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────┐
│           DiixWhatsApp                  │
└───────────────┬─────────────────────────┘
                │
        ┌───────▼───────┐
        │  Autenticação │
        └───────┬───────┘
                │
    ┌───────────┴───────────┐
    │                       │
┌───▼────┐           ┌─────▼─────┐
│ MASTER │           │  TENANT   │
│ Admin  │           │   Loja    │
└───┬────┘           └─────┬─────┘
    │                      │
┌───▼────────┐      ┌──────▼──────┐
│ Dashboard  │      │  Dashboard  │
│ Global     │      │  Loja       │
│ CRUD Lojas │      │  Produtos   │
│ CRUD Users │      │  Clientes   │
│ Stats      │      │  Serviços   │
└────────────┘      │  Promoções  │
                    └─────────────┘
```

---

## 🛠️ Tecnologias

| Categoria | Tecnologia |
|-----------|------------|
| Runtime | Node.js LTS (ESM) |
| Framework | Express.js 5.x |
| Banco de Dados | PostgreSQL 14+ |
| ORM | Prisma |
| Template Engine | EJS |
| Autenticação | express-session + bcrypt |
| Validação | Zod |
| Segurança | Helmet, CSRF, Rate Limiting |
| Logs | Pino |

---

## 📦 Instalação

### Pré-requisitos

- Node.js LTS (v18+)
- PostgreSQL 14+
- npm ou yarn

### Passos

1. **Clone o repositório**
```bash
cd diixwhatsapp
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure as variáveis de ambiente**
```bash
cp .env.example .env
# Edite .env com suas credenciais
```

4. **Gere o Prisma Client**
```bash
npm run db:generate
```

5. **Execute as migrations**
```bash
npm run db:migrate
```

6. **Popule o banco (seed)**
```bash
npm run db:seed
```

7. **Inicie o servidor**
```bash
# Desenvolvimento (com hot reload)
npm run dev

# Produção
npm start
```

O sistema estará disponível em: `http://localhost:7171`

---

## 🔐 Credenciais Padrão

Após executar o seed:

| Usuário | Username | Senha | Role |
|---------|----------|-------|------|
| Master | dixavado | (definida no .env) | MASTER |
| Admin Loja A | admin-loja-a | senha123 | TENANT_ADMIN |
| Admin Loja B | admin-loja-b | senha123 | TENANT_ADMIN |
| Usuário Loja A | usuario-loja-a | senha123 | TENANT_USER |

**⚠️ IMPORTANTE:** Altere a senha do usuário Master no `.env` antes de usar em produção!

---

## 📁 Estrutura do Projeto

```
diixwhatsapp/
├── src/
│   ├── app.js                 # App Express
│   ├── server.js              # Entry point
│   ├── config/                # Configurações
│   ├── controllers/           # Controladores
│   ├── middleware/            # Middlewares
│   ├── routes/                # Rotas
│   ├── services/              # Regras de negócio
│   ├── repositories/          # Acesso a dados
│   ├── validators/            # Validações Zod
│   └── utils/                 # Utilitários
├── views/                     # Templates EJS
├── public/                    # Arquivos estáticos
├── prisma/
│   ├── schema.prisma          # Schema DB
│   └── seed.js                # Seed inicial
├── tests/                     # Testes
├── docs/                      # Documentação
├── .env.example               # Template .env
├── package.json
└── README.md
```

---

## 🎭 Roles e Permissões

### MASTER
- Acesso global ao sistema
- CRUD de Tenants (lojas)
- CRUD de Usuários
- Visualização de estatísticas globais
- Acesso a dados de qualquer Tenant

### TENANT_ADMIN
- Acesso somente ao próprio Tenant
- CRUD de Produtos, Clientes, Serviços, Promoções
- Gerenciamento de usuários da própria loja
- Edição de configurações da loja

### TENANT_USER
- Acesso operacional ao próprio Tenant
- Visualização de dados
- Operações limitadas

---

## 🔒 Multi-Tenancy

O sistema implementa **isolamento rigoroso**:

1. Todas as entidades possuem `tenantId`
2. O `tenantId` é obtido **exclusivamente da sessão**
3. Todas as consultas filtram automaticamente por tenant
4. Middleware previne acesso cross-tenant

### Exemplo de Isolamento

```javascript
// ✅ CORRETO
const product = await prisma.product.findFirst({
  where: {
    id: productId,
    tenantId: req.user.tenantId  // Da sessão
  }
});

// ❌ ERRADO - Nunca faça isso
const product = await prisma.product.findUnique({
  where: { id: productId }  // Sem filtro!
});
```

---

## 🛡️ Segurança

| Recurso | Implementação |
|---------|--------------|
| Hash de Senhas | bcrypt (12 rounds) |
| Sessões | HTTPOnly, SameSite=Lax, Secure (prod) |
| CSRF | Token em todos os formulários POST |
| Rate Limiting | Limite por IP |
| Headers | Helmet configurado |
| Validação | Zod em todos os inputs |
| Logs | Sem dados sensíveis |

---

## 📊 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Produção
npm start

# Banco de dados
npm run db:generate   # Gerar Prisma Client
npm run db:migrate    # Criar migrations (dev)
npm run db:deploy     # Deploy migrations (prod)
npm run db:seed       # Executar seed
npm run db:studio     # Prisma Studio (GUI)

# Testes
npm test
```

---

## 🧪 Testes

### Teste Crítico de Isolamento

```bash
# Execute após setup completo
npm test
```

O teste valida:
- Tenant A não acessa dados de Tenant B
- MASTER acessa todos os dados
- Usuários inativos não fazem login
- Tenants inativos não autenticam

---

## 🐳 Docker (Em implementação)

```dockerfile
# Dockerfile em desenvolvimento
# Consulte docs/ para instruções de containerização
```

---

## 📖 Documentação Completa

Consulte a pasta `docs/`:

- [README_GERAL.md](docs/README_GERAL.md) - Visão geral detalhada
- [PROGRESSO_TODO.md](docs/PROGRESSO_TODO.md) - Status e tarefas
- [RELATORIO_GERAL.md](docs/RELATORIO_GERAL.md) - Relatório técnico

---

## 🚀 Deploy

### Railway / Render / Fly.io

1. Configure `DATABASE_URL` nas variáveis do provedor
2. Defina `SESSION_SECRET` aleatório
3. Ajuste `MASTER_PASSWORD`
4. Deploy automático via Git

### VPS/Docker

```bash
# Build
docker build -t diixwhatsapp .

# Run
docker run -p 7171:7171 \
  -e DATABASE_URL=postgresql://... \
  -e SESSION_SECRET=secret \
  diixwhatsapp
```

---

## 🔧 Troubleshooting

### Erro: DATABASE_URL não definida
```bash
# Verifique se .env existe
cp .env.example .env
# Preencha DATABASE_URL corretamente
```

### Erro: Prisma Client não gerado
```bash
npm run db:generate
```

### Erro: Migrações pendentes
```bash
npm run db:migrate
```

### Erro: Seed já executado
```bash
# O seed verifica existência do master
# Para resetar, drope o banco e execute novamente
```

---

## 📝 Licença

ISC - Diix Solutions

---

## 👨‍💻 Desenvolvedor

**Dixavado** - Diix Solutions

---

## 🔄 Próximas Versões (Roadmap)

- [ ] Integração Evolution API (WhatsApp)
- [ ] Sistema de pedidos
- [ ] Pagamentos (PIX)
- [ ] Relatórios avançados
- [ ] API REST
- [ ] Webhooks

---

**Versão:** 1.0.0  
**Última atualização:** Agosto 2024


## 🧪 Estrutura de Testes Implementada

```
tests/
├── README.md                    # Guia completo de testes
├── helpers.js                   # Utilitários compartilhados
├── isolation.test.js            # Testes de isolamento multi-tenant
├── integration/
│   └── api.test.js             # Testes de integração da API
└── unit/
    ├── repositories.test.js    # Testes unitários de repositórios
    └── validators.test.js      # Testes de validação Zod
```

### Scripts Disponíveis

```bash
npm test                       # Executa todos os testes
npm run test:watch            # Watch mode (reexecuta automaticamente)
npm run test:coverage         # Gera relatório de cobertura
npm run test:unit             # Apenas testes unitários
npm run test:integration      # Apenas testes de integração
npm run test:isolation        # Testes de isolamento multi-tenant
```

### GitHub Actions

Workflow configurado em `.github/workflows/test.yml` com:
- ✅ Execução automática em push/PR
- ✅ Banco PostgreSQL temporário
- ✅ 4 jobs: testes, lint, security, build
- ✅ Relatório de cobertura como artefato

### Total de Testes

- **Isolamento Multi-Tenant:** 9 testes
- **Integração API:** 25+ testes
- **Unitários Repositórios:** 40+ testes
- **Validações Zod:** 30+ testes

**Total: 100+ testes automatizados** 🎉

