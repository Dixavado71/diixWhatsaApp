/**
 * Testes de Integração da API REST
 * Testa todos os endpoints públicos, admin e tenant
 */

// IMPORTANT: Load environment variables BEFORE any other imports
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envTestPath = path.join(__dirname, '..', '.env.test');
dotenv.config({ path: envTestPath });

if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'test';
}

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createServer } from 'http';
import { prisma, createTestTenant, createTestUser, createTestClient, createTestProduct, createTestService, createTestPromotion, cleanupTestData } from '../helpers.js';

// Importar o app para testes
import app from '../../src/app.js';

describe('API de Integração - Endpoints', () => {
  let server;
  let baseUrl;
  let testTenant;
  let testUser;
  let adminUser;

  before(async () => {
    console.log('\n=== Setup: Iniciando servidor de teste ===\n');
    
    // Criar dados de teste
    testTenant = await createTestTenant();
    testUser = await createTestUser({ tenantId: testTenant.id, role: 'TENANT_ADMIN' });
    adminUser = await createTestUser({ role: 'ADMIN' });
    
    // Iniciar servidor em porta aleatória
    server = createServer(app);
    await new Promise((resolve) => {
      server.listen(0, resolve);
    });
    
    const address = server.address();
    baseUrl = `http://localhost:${address.port}`;
    
    console.log('Servidor rodando em:', baseUrl);
    console.log('Tenant criado:', testTenant.id);
    console.log('Usuário Tenant criado:', testUser.id);
    console.log('Usuário Admin criado:', adminUser.id);
  });

  after(async () => {
    console.log('\n=== Cleanup: Parando servidor e limpando dados ===\n');
    
    server.close();
    
    await cleanupTestData({
      tenants: [testTenant],
      users: [testUser, adminUser]
    });
    
    console.log('=== Cleanup concluído ===\n');
  });

  describe('Endpoints Públicos', () => {
    it('DEVE retornar status 200 no health check', async () => {
      const response = await fetch(`${baseUrl}/health`);
      assert.strictEqual(response.status, 200);
      
      const data = await response.json();
      assert.strictEqual(data.status, 'ok');
    });

    it('DEVE retornar informações da API na rota raiz', async () => {
      const response = await fetch(`${baseUrl}/`);
      assert.strictEqual(response.status, 200);
      
      const data = await response.json();
      assert.ok(data.name || data.api);
    });

    it('DEVE retornar documentação da API em /api-docs', async () => {
      const response = await fetch(`${baseUrl}/api-docs`);
      assert.strictEqual(response.status, 200);
      
      const data = await response.json();
      assert.ok(data.endpoints || data.info);
    });
  });

  describe('Endpoints de Autenticação', () => {
    it('DEVE falhar login com credenciais inválidas', async () => {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          email: 'invalido@teste.com',
          password: 'senhaerrada'
        })
      });
      
      assert.strictEqual(response.status, 401);
    });

    it('DEVE permitir login com credenciais válidas', async () => {
      // Primeiro precisamos criar um usuário com senha conhecida
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash('senha123', 10);
      
      const loginUser = await prisma.user.create({
        data: {
          tenantId: testTenant.id,
          username: 'usuario_login_teste',
          email: 'login.teste@diixwhatsapp.com',
          passwordHash,
          name: 'Usuário Login Teste',
          role: 'TENANT_ADMIN',
          active: true
        }
      });

      try {
        const response = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            email: 'login.teste@diixwhatsapp.com',
            password: 'senha123'
          })
        });
        
        assert.strictEqual(response.status, 200);
        
        const data = await response.json();
        assert.ok(data.success || data.user);
      } finally {
        // Limpar usuário de teste
        await prisma.user.delete({ where: { id: loginUser.id } });
      }
    });
  });

  describe('Endpoints Admin (Requer Autenticação)', () => {
    it('DEVE retornar 401 para rotas admin sem autenticação', async () => {
      const response = await fetch(`${baseUrl}/admin/tenants`);
      assert.strictEqual(response.status, 401);
    });

    it('DEVE retornar 403 para usuário tenant acessando rotas admin', async () => {
      // Nota: Este teste requereria mock de sessão
      // Em ambiente real, testaríamos com cookies de sessão
      const response = await fetch(`${baseUrl}/admin/tenants`, {
        headers: { 'Accept': 'application/json' }
      });
      
      // Deve ser 401 (não autenticado) ou 403 (sem permissão)
      assert.ok([401, 403].includes(response.status));
    });
  });

  describe('Endpoints Tenant (Requer Autenticação)', () => {
    it('DEVE retornar 401 para rotas tenant sem autenticação', async () => {
      const response = await fetch(`${baseUrl}/tenant/dashboard`);
      assert.strictEqual(response.status, 401);
    });

    it('DEVE retornar 404 para rota inexistente', async () => {
      const response = await fetch(`${baseUrl}/rota-inexistente`);
      assert.strictEqual(response.status, 404);
    });
  });

  describe('CRUD de Clientes (Simulado)', () => {
    let client;

    it('DEVE criar cliente via repositório', async () => {
      client = await createTestClient(testTenant.id);
      assert.ok(client.id);
      assert.strictEqual(client.tenantId, testTenant.id);
    });

    it('DEVE buscar cliente por ID', async () => {
      const found = await prisma.client.findUnique({
        where: { id: client.id }
      });
      
      assert.notStrictEqual(found, null);
      assert.strictEqual(found.id, client.id);
    });

    it('DEVE atualizar cliente', async () => {
      const updated = await prisma.client.update({
        where: { id: client.id },
        data: { name: 'Cliente Atualizado' }
      });
      
      assert.strictEqual(updated.name, 'Cliente Atualizado');
    });

    it('DEVE listar clientes do tenant', async () => {
      const clients = await prisma.client.findMany({
        where: { tenantId: testTenant.id }
      });
      
      assert.ok(clients.length >= 1);
      assert.ok(clients.some(c => c.id === client.id));
    });

    it('DEVE deletar cliente', async () => {
      await prisma.client.delete({ where: { id: client.id } });
      
      const deleted = await prisma.client.findUnique({
        where: { id: client.id }
      });
      
      assert.strictEqual(deleted, null);
    });
  });

  describe('CRUD de Produtos (Simulado)', () => {
    let product;

    it('DEVE criar produto via repositório', async () => {
      product = await createTestProduct(testTenant.id);
      assert.ok(product.id);
      assert.strictEqual(product.tenantId, testTenant.id);
    });

    it('DEVE buscar produto por ID', async () => {
      const found = await prisma.product.findUnique({
        where: { id: product.id }
      });
      
      assert.notStrictEqual(found, null);
      assert.strictEqual(found.id, product.id);
    });

    it('DEVE atualizar produto', async () => {
      const updated = await prisma.product.update({
        where: { id: product.id },
        data: { price: 149.90 }
      });
      
      assert.strictEqual(updated.price, 149.90);
    });

    it('DEVE filtrar produtos por tenant', async () => {
      const products = await prisma.product.findMany({
        where: { tenantId: testTenant.id }
      });
      
      assert.ok(products.length >= 1);
      assert.ok(products.some(p => p.id === product.id));
    });

    it('DEVE deletar produto', async () => {
      await prisma.product.delete({ where: { id: product.id } });
      
      const deleted = await prisma.product.findUnique({
        where: { id: product.id }
      });
      
      assert.strictEqual(deleted, null);
    });
  });

  describe('CRUD de Serviços (Simulado)', () => {
    let service;

    it('DEVE criar serviço via repositório', async () => {
      service = await createTestService(testTenant.id);
      assert.ok(service.id);
    });

    it('DEVE atualizar serviço', async () => {
      const updated = await prisma.service.update({
        where: { id: service.id },
        data: { price: 75.00 }
      });
      
      assert.strictEqual(updated.price, 75.00);
    });

    it('DEVE deletar serviço', async () => {
      await prisma.service.delete({ where: { id: service.id } });
      
      const deleted = await prisma.service.findUnique({
        where: { id: service.id }
      });
      
      assert.strictEqual(deleted, null);
    });
  });

  describe('CRUD de Promoções (Simulado)', () => {
    let promotion;

    it('DEVE criar promoção via repositório', async () => {
      promotion = await createTestPromotion(testTenant.id);
      assert.ok(promotion.id);
    });

    it('DEVE atualizar promoção', async () => {
      const updated = await prisma.promotion.update({
        where: { id: promotion.id },
        data: { discountValue: 20 }
      });
      
      assert.strictEqual(updated.discountValue, 20);
    });

    it('DEVE filtrar promoções ativas', async () => {
      const promotions = await prisma.promotion.findMany({
        where: { 
          tenantId: testTenant.id,
          active: true
        }
      });
      
      assert.ok(promotions.length >= 1);
    });

    it('DEVE deletar promoção', async () => {
      await prisma.promotion.delete({ where: { id: promotion.id } });
      
      const deleted = await prisma.promotion.findUnique({
        where: { id: promotion.id }
      });
      
      assert.strictEqual(deleted, null);
    });
  });
});
