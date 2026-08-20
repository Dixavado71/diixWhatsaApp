# Prisma Connection Pooling Configuration

## Production Database URL Configuration

Para produção, adicione `connection_limit` na `DATABASE_URL` no seu `.env`:

```env
# PostgreSQL com connection pooling
DATABASE_URL="postgresql://user:password@localhost:5432/dbname?connection_limit=10&pool_timeout=20&connect_timeout=10"
```

### Parâmetros de Pooling:

- `connection_limit`: Número máximo de conexões no pool (recomendado: 10-20 para produção)
- `pool_timeout`: Tempo máximo em segundos esperando por uma conexão disponível (default: 20)
- `connect_timeout`: Tempo máximo em segundos para estabelecer conexão (default: 10)

## Configuração no Schema (Opcional)

Alternativamente, você pode configurar diretamente no schema.prisma:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Configurações de pool (Prisma 5+)
  relationMode = "foreignKeys"
}
```

## Recomendações por Ambiente:

### Desenvolvimento:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/devdb?connection_limit=5"
```

### Produção (Pequeno Porte):
```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/proddb?connection_limit=10"
```

### Produção (Médio/Grande Porte):
```env
DATABASE_URL="postgresql://user:pass@prod-host:5432/proddb?connection_limit=20&pool_timeout=30"
```

## Monitoramento

O Prisma Client já está configurado como singleton e em produção os logs de query estão desativados para evitar:
- Vazamento de dados sensíveis
- Overhead de performance
- Poluição de logs

Para monitorar conexões em produção, use:
```javascript
import { prisma } from './infrastructure/database/prismaClient.js';

// Verificar status das conexões (apenas para debugging)
const stats = await prisma.$queryRaw`SELECT count(*) as connections FROM pg_stat_activity WHERE datname = current_database()`;
```
