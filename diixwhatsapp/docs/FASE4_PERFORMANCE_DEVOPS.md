# Fase 4: Performance, Escalabilidade e DevOps

## Resumo das Implementações

Esta fase prepara o DiixWhatsApp para produção e escala horizontal com as seguintes melhorias:

---

## 1. Prisma Connection Pooling ✅

### Configuração no `.env` (Produção):

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?connection_limit=10&pool_timeout=20&connect_timeout=10"
```

### Parâmetros Recomendados:

| Ambiente | connection_limit | pool_timeout | connect_timeout |
|----------|-----------------|--------------|-----------------|
| Desenvolvimento | 5 | 10 | 5 |
| Produção (Pequeno) | 10 | 20 | 10 |
| Produção (Grande) | 20 | 30 | 10 |

### Documentação Completa:
Veja `prisma/PRISMA_POOLING.md` para detalhes completos.

---

## 2. Sessão Redis para Escala Horizontal ✅

### Instalação:
```bash
npm install --save redis ioredis connect-redis
```

### Arquivos Criados/Modificados:

#### `src/infrastructure/cache/redisClient.js` (NOVO)
- Singleton do Redis Client usando `ioredis`
- Configurações otimizadas para produção
- Health check integrado
- Reconexão automática

#### `src/config/session.js` (MODIFICADO)
- Migração de `MemoryStore` para `RedisStore`
- Fallback para MemoryStore apenas em desenvolvimento
- Configuração pronta para múltiplas instâncias do servidor

### Configuração no `.env`:
```env
REDIS_URL="redis://localhost:6379"
# Produção: REDIS_URL="redis://user:password@redis-host:6379"
```

### Benefícios:
- ✅ **Escala Horizontal**: Múltiplas instâncias compartilham sessões
- ✅ **Persistência**: Sessões sobrevivem a reinícios do servidor
- ✅ **Performance**: Redis em memória é mais rápido que banco de dados
- ✅ **Failover**: Suporte a Redis Cluster/Sentinel em produção

---

## 3. Versionamento de API (/api/v1/) ✅

### Mudanças no `src/app.js`:

Todas as rotas agora são montadas sob o prefixo `/api/v1/`:

```javascript
// Antigo:
GET  /tenant/products
POST /admin/tenants

// Novo:
GET  /api/v1/tenant/products
POST /api/v1/admin/tenants
```

### Estrutura de Rotas:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/v1/auth/login` | Login page |
| POST | `/api/v1/auth/login` | Authenticate |
| POST | `/api/v1/auth/logout` | Logout |
| GET | `/api/v1/admin/dashboard` | Admin dashboard |
| GET | `/api/v1/admin/tenants` | List tenants |
| POST | `/api/v1/admin/tenants` | Create tenant |
| GET | `/api/v1/tenant/dashboard` | Tenant dashboard |
| GET | `/api/v1/tenant/products` | List products |
| ... | ... | ... |

### Benefícios:
- ✅ **Evolução sem Breaking Changes**: Futuras versões em `/api/v2/`
- ✅ **Versionamento Semântico**: Claro para consumidores da API
- ✅ **Depreciação Controlada**: Versões antigas podem coexistir

---

## 4. CI/CD Pipeline (GitHub Actions) ✅

### Arquivo: `.github/workflows/ci.yml`

O pipeline executa em cada push/PR:

```yaml
✅ Checkout do código
✅ Setup Node.js 20
✅ Instalação de dependências (npm ci)
✅ Geração do Prisma Client
✅ Lint/Syntax check
✅ Migrações do banco
✅ Validação do schema Prisma
✅ Execução de testes
✅ Relatório de cobertura
✅ Auditoria de segurança (npm audit)
```

### Serviços no CI:
- **PostgreSQL 15**: Para testes de banco
- **Redis 7**: Para testes de sessão/cache

### Comandos Locais Equivalentes:
```bash
npm ci
npm run db:generate
npm run db:migrate
npx prisma validate
npm test
npm audit
```

---

## 5. Audit Log Assíncrono ✅

### Arquivo Modificado: `src/repositories/auditLogRepository.js`

### Implementação:
```javascript
async create(data) {
  return new Promise((resolve) => {
    setImmediate(async () => {
      try {
        await prisma.auditLog.create({ data });
        resolve({ success: true });
      } catch (error) {
        console.error('[AuditLog] Failed:', error.message);
        resolve({ success: false, error: error.message });
      }
    });
  });
}
```

### Benefícios:
- ✅ **Não Bloqueante**: Response enviado sem esperar log
- ✅ **Resiliência**: Erros no log não quebram a requisição principal
- ✅ **Performance**: Melhor latência percebida pelo usuário

### Alternativa para Alta Escala:
Para sistemas com >1000 req/s, considere usar **BullMQ** com Redis:

```bash
npm install bullmq
```

```javascript
import { Queue } from 'bullmq';

const auditQueue = new Queue('audit-logs', {
  connection: redisClient
});

// Enfileirar log
await auditQueue.add('create', data, {
  attempts: 3,
  backoff: { type: 'exponential', delay: 1000 }
});
```

---

## 6. Health Check Avançado ✅

### Novos Endpoints:

#### `GET /health` (Básico)
```json
{
  "status": "ok",
  "service": "DiixWhatsApp"
}
```

#### `GET /health/advanced` (Completo)
```json
{
  "status": "ok",
  "service": "DiixWhatsApp",
  "version": "1.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "checks": {
    "database": { "status": "healthy" },
    "redis": { "status": "healthy" }
  }
}
```

#### `GET /health/db` (Apenas Database)
```json
{
  "status": "ok",
  "database": "connected"
}
```

### Códigos de Status:
- **200 OK**: Todos os serviços saudáveis
- **503 Service Unavailable**: Um ou mais serviços indisponíveis

### Uso em Kubernetes/Docker:
```yaml
livenessProbe:
  httpGet:
    path: /health/advanced
    port: 3000
  initialDelaySeconds: 10
  periodSeconds: 30
  
readinessProbe:
  httpGet:
    path: /health/advanced
    port: 3000
  initialDelaySeconds: 5
  periodSeconds: 10
```

---

## Checklist de Produção

### Antes de Deploy:

- [ ] Configurar `DATABASE_URL` com pooling no `.env`
- [ ] Configurar `REDIS_URL` apontando para Redis production
- [ ] Definir `NODE_ENV=production`
- [ ] Gerar segredos fortes para `SESSION_SECRET` e `CSRF_SECRET`
- [ ] Habilitar HTTPS (cookie secure requer HTTPS)
- [ ] Testar health checks (`/health/advanced`)
- [ ] Validar migrações do banco
- [ ] Rodar suite completa de testes

### Variáveis de Ambiente Obrigatórias:

```env
NODE_ENV=production
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=10"
REDIS_URL="redis://user:pass@redis-host:6379"
SESSION_SECRET="gerar-com-crypto-random--length-64"
CSRF_SECRET="gerar-com-crypto-random--length-64"
FRONTEND_URL="https://seu-dominio.com"
API_URL="https://api.seu-dominio.com"
PORT=3000
```

---

## Próximos Passos (Opcional)

1. **Rate Limiting por IP/Usuário**: Implementar limites diferenciados
2. **Cache de Consultas**: Redis para queries frequentes
3. **Filas de Background**: BullMQ para tarefas assíncronas pesadas
4. **Monitoramento**: Integração com Prometheus/Grafana
5. **Logging Estruturado**: Envio de logs para ELK/Datadog
6. **APM**: New Relic/DataDog para tracing distribuído
