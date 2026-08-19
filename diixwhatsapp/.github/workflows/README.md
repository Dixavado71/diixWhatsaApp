# Workflows de CI/CD - DiixWhatsApp

## 📋 Visão Geral

Este diretório contém os workflows do GitHub Actions para integração e entrega contínua do projeto DiixWhatsApp.

## 🔧 Workflows Disponíveis

### `test.yml` - Pipeline Principal de Testes

Executa automaticamente quando:
- Há push nas branches `main`, `develop` ou `master`
- Há pull request para essas branches

#### Jobs Incluídos:

1. **🧪 Executar Testes**
   - Configura banco PostgreSQL temporário
   - Instala dependências
   - Gera Prisma Client
   - Roda migrações
   - Executa todos os testes
   - Gera relatório de cobertura

2. **🔍 Verificar Qualidade do Código**
   - Valida sintaxe de todos os arquivos de teste

3. **🔒 Verificação de Segurança**
   - Auditoria de vulnerabilidades npm

4. **🏗️ Verificar Build**
   - Valida geração do Prisma Client

## 🚀 Como Usar

### Execução Automática

Os workflows são executados automaticamente ao fazer push ou criar PR.

### Execução Manual (Opcional)

Para adicionar execução manual, adicione ao início do workflow:

```yaml
workflow_dispatch:
```

## 📊 Resultados

### Status dos Tests

- ✅ **Sucesso**: Todos os testes passaram
- ❌ **Falha**: Um ou mais testes falharam
- ⚠️ **Warning**: Alertas de segurança ou coverage baixo

### Artefatos Gerados

- **coverage-report**: Relatório de cobertura de testes (disponível por 7 dias)

## 🔍 Visualizar Resultados

1. Acesse a aba **Actions** no GitHub
2. Clique no workflow executado
3. Veja o output de cada job
4. Baixe artefatos se necessário

## 🛠️ Personalização

### Adicionar Novo Job

```yaml
  meu-job:
    name: 🎯 Meu Job Personalizado
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Meu comando
        run: echo "Olá!"
```

### Alterar Versão do Node

Edite no workflow:
```yaml
node-version: '20'  # Ou versão desejada
```

### Mudar Branches Monitoradas

Edite no `on:`:
```yaml
on:
  push:
    branches: [ main, develop, feature/* ]
```

## 🆘 Troubleshooting

### Workflow Não Executa

- Verifique se está na branch correta
- Confira permissões do repositório
- Valide sintaxe YAML em [yamllint.com](https://yamllint.com)

### Testes Falhando no CI mas Passando Localmente

- Verifique variáveis de ambiente
- Confirme conexão com banco de dados
- Valide se migrations estão corretas

### Timeout nos Testes

Aumente o timeout no job:
```yaml
timeout-minutes: 30
```

---

**Nota:** Este workflow requer que o repositório tenha acesso a um banco PostgreSQL. O GitHub Actions configura automaticamente um container PostgreSQL para os testes.
