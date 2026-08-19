# DiixWhatsApp - Dockerfile
# Node.js LTS

FROM node:20-alpine

# Instalar dependências de build
RUN apk add --no-cache openssl

# Criar diretório da aplicação
WORKDIR /app

# Copiar package files
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Expor porta
EXPOSE 7171

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:7171/health || exit 1

# Iniciar aplicação
CMD ["npm", "start"]
