/**
 * Testes Unitários dos Repositórios
 * Testa a camada de acesso a dados isoladamente
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma, createTestTenant, createTestUser, createTestClient, createTestProduct, createTestService, createTestPromotion, cleanupTestData } from '../helpers.js';

describe('Repositórios - Testes Unitários', () => {
  let testTenant;
  let testUser;

  before(async () => {
    console.log('\n=== Setup: Criando tenant e usuário para testes ===\n');
    testTenant = await createTestTenant();
    testUser = await createTestUser({ tenantId: testTenant.id });
  });

  after(async () => {
    console.log('\n=== Cleanup: Removendo dados de teste ===\n');
    await cleanupTestData({
      tenants: [testTenant],
      users: [testUser]
    });
  });

  describe('TenantRepository (via Prisma)', () => {
    it('DEVE criar um novo tenant', async () => {
      const tenant = await createTestTenant({ name: 'Tenant Unitário' });
      assert.ok(tenant.id);
      assert.strictEqual(tenant.name, 'Tenant Unitário');
      
      await prisma.tenant.delete({ where: { id: tenant.id } });
    });

    it('DEVE buscar tenant por ID', async () => {
      const found = await prisma.tenant.findUnique({
        where: { id: testTenant.id }
      });
      
      assert.notStrictEqual(found, null);
      assert.strictEqual(found.id, testTenant.id);
    });

    it('DEVE buscar tenant por slug', async () => {
      const found = await prisma.tenant.findUnique({
        where: { slug: testTenant.slug }
      });
      
      assert.notStrictEqual(found, null);
      assert.strictEqual(found.slug, testTenant.slug);
    });

    it('DEVE atualizar tenant', async () => {
      const updated = await prisma.tenant.update({
        where: { id: testTenant.id },
        data: { name: 'Tenant Atualizado' }
      });
      
      assert.strictEqual(updated.name, 'Tenant Atualizado');
    });

    it('DEVE listar todos os tenants', async () => {
      const tenants = await prisma.tenant.findMany();
      assert.ok(tenants.length >= 1);
    });

    it('DEVE filtrar tenants ativos', async () => {
      const activeTenants = await prisma.tenant.findMany({
        where: { active: true }
      });
      
      assert.ok(activeTenants.every(t => t.active === true));
    });

    it('DEVE deletar tenant', async () => {
      const tempTenant = await createTestTenant();
      
      await prisma.tenant.delete({ where: { id: tempTenant.id } });
      
      const deleted = await prisma.tenant.findUnique({
        where: { id: tempTenant.id }
      });
      
      assert.strictEqual(deleted, null);
    });
  });

  describe('UserRepository (via Prisma)', () => {
    it('DEVE criar um novo usuário', async () => {
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash('senha123', 10);
      
      const user = await prisma.user.create({
        data: {
          tenantId: testTenant.id,
          username: 'user_unit_test',
          email: 'unit.test@diixwhatsapp.com',
          passwordHash,
          name: 'Usuário Unitário',
          role: 'TENANT_ADMIN',
          active: true
        }
      });
      
      assert.ok(user.id);
      assert.strictEqual(user.username, 'user_unit_test');
      
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('DEVE buscar usuário por ID', async () => {
      const found = await prisma.user.findUnique({
        where: { id: testUser.id }
      });
      
      assert.notStrictEqual(found, null);
      assert.strictEqual(found.id, testUser.id);
    });

    it('DEVE buscar usuário por email', async () => {
      const found = await prisma.user.findUnique({
        where: { email: testUser.email }
      });
      
      assert.notStrictEqual(found, null);
      assert.strictEqual(found.email, testUser.email);
    });

    it('DEVE filtrar usuários por tenant', async () => {
      const users = await prisma.user.findMany({
        where: { tenantId: testTenant.id }
      });
      
      assert.ok(users.length >= 1);
      assert.ok(users.every(u => u.tenantId === testTenant.id));
    });

    it('DEVE filtrar usuários por role', async () => {
      const tenantAdmins = await prisma.user.findMany({
        where: { role: 'TENANT_ADMIN' }
      });
      
      assert.ok(tenantAdmins.every(u => u.role === 'TENANT_ADMIN'));
    });

    it('DEVE atualizar usuário', async () => {
      const updated = await prisma.user.update({
        where: { id: testUser.id },
        data: { name: 'Nome Atualizado' }
      });
      
      assert.strictEqual(updated.name, 'Nome Atualizado');
    });

    it('DEVE verificar senha correta', async () => {
      const bcrypt = await import('bcrypt');
      const validPassword = await bcrypt.compare('senha123', testUser.passwordHash);
      
      assert.strictEqual(validPassword, true);
    });

    it('DEVE rejeitar senha incorreta', async () => {
      const bcrypt = await import('bcrypt');
      const invalidPassword = await bcrypt.compare('senhaerrada', testUser.passwordHash);
      
      assert.strictEqual(invalidPassword, false);
    });

    it('DEVE deletar usuário', async () => {
      const bcrypt = await import('bcrypt');
      const passwordHash = await bcrypt.hash('senha123', 10);
      
      const tempUser = await prisma.user.create({
        data: {
          tenantId: testTenant.id,
          username: 'temp_user',
          email: 'temp@diixwhatsapp.com',
          passwordHash,
          name: 'Usuário Temporário',
          role: 'TENANT_USER',
          active: true
        }
      });
      
      await prisma.user.delete({ where: { id: tempUser.id } });
      
      const deleted = await prisma.user.findUnique({
        where: { id: tempUser.id }
      });
      
      assert.strictEqual(deleted, null);
    });
  });

  describe('ClientRepository (via Prisma)', () => {
    let client;

    before(async () => {
      client = await createTestClient(testTenant.id);
    });

    after(async () => {
      if (client?.id) {
        try {
          await prisma.client.delete({ where: { id: client.id } });
        } catch (e) {
          // Já pode ter sido deletado
        }
      }
    });

    it('DEVE criar cliente com dados completos', async () => {
      const newClient = await createTestClient(testTenant.id, {
        name: 'Cliente Completo',
        phone: '(11) 98888-7777'
      });
      
      assert.ok(newClient.id);
      assert.strictEqual(newClient.name, 'Cliente Completo');
      
      await prisma.client.delete({ where: { id: newClient.id } });
    });

    it('DEVE buscar cliente por ID', async () => {
      const found = await prisma.client.findUnique({
        where: { id: client.id }
      });
      
      assert.notStrictEqual(found, null);
      assert.strictEqual(found.id, client.id);
    });

    it('DEVE filtrar clientes por tenant', async () => {
      const clients = await prisma.client.findMany({
        where: { tenantId: testTenant.id }
      });
      
      assert.ok(clients.length >= 1);
      assert.ok(clients.every(c => c.tenantId === testTenant.id));
    });

    it('DEVE filtrar clientes ativos', async () => {
      const activeClients = await prisma.client.findMany({
        where: { 
          tenantId: testTenant.id,
          active: true
        }
      });
      
      assert.ok(activeClients.every(c => c.active === true));
    });

    it('DEVE atualizar cliente', async () => {
      const updated = await prisma.client.update({
        where: { id: client.id },
        data: { phone: '(21) 99999-8888' }
      });
      
      assert.strictEqual(updated.phone, '(21) 99999-8888');
    });

    it('DEVE buscar cliente por email', async () => {
      const found = await prisma.client.findFirst({
        where: { 
          email: client.email,
          tenantId: testTenant.id
        }
      });
      
      assert.notStrictEqual(found, null);
      assert.strictEqual(found.email, client.email);
    });
  });

  describe('ProductRepository (via Prisma)', () => {
    let product;

    before(async () => {
      product = await createTestProduct(testTenant.id);
    });

    after(async () => {
      if (product?.id) {
        try {
          await prisma.product.delete({ where: { id: product.id } });
        } catch (e) {
          // Já pode ter sido deletado
        }
      }
    });

    it('DEVE criar produto com estoque', async () => {
      const newProduct = await createTestProduct(testTenant.id, {
        name: 'Produto com Estoque',
        stock: 50,
        price: 199.90
      });
      
      assert.ok(newProduct.id);
      assert.strictEqual(newProduct.stock, 50);
      
      await prisma.product.delete({ where: { id: newProduct.id } });
    });

    it('DEVE buscar produto por slug', async () => {
      const found = await prisma.product.findUnique({
        where: { slug: product.slug }
      });
      
      assert.notStrictEqual(found, null);
      assert.strictEqual(found.slug, product.slug);
    });

    it('DEVE filtrar produtos ativos', async () => {
      const activeProducts = await prisma.product.findMany({
        where: {
          tenantId: testTenant.id,
          active: true
        }
      });
      
      assert.ok(activeProducts.every(p => p.active === true));
    });

    it('DEVE atualizar preço do produto', async () => {
      const updated = await prisma.product.update({
        where: { id: product.id },
        data: { price: 299.90 }
      });
      
      assert.strictEqual(updated.price, 299.90);
    });

    it('DEVE atualizar estoque do produto', async () => {
      const updated = await prisma.product.update({
        where: { id: product.id },
        data: { stock: 5 }
      });
      
      assert.strictEqual(updated.stock, 5);
    });

    it('DEVE filtrar produtos com baixo estoque', async () => {
      const lowStock = await prisma.product.findMany({
        where: {
          tenantId: testTenant.id,
          stock: { lte: 10 }
        }
      });
      
      assert.ok(lowStock.every(p => p.stock <= 10));
    });
  });

  describe('ServiceRepository (via Prisma)', () => {
    let service;

    before(async () => {
      service = await createTestService(testTenant.id);
    });

    after(async () => {
      if (service?.id) {
        try {
          await prisma.service.delete({ where: { id: service.id } });
        } catch (e) {
          // Já pode ter sido deletado
        }
      }
    });

    it('DEVE criar serviço com descrição', async () => {
      const newService = await createTestService(testTenant.id, {
        name: 'Serviço Premium',
        description: 'Serviço com descrição completa',
        price: 150.00
      });
      
      assert.ok(newService.id);
      assert.strictEqual(newService.description, 'Serviço com descrição completa');
      
      await prisma.service.delete({ where: { id: newService.id } });
    });

    it('DEVE filtrar serviços ativos', async () => {
      const activeServices = await prisma.service.findMany({
        where: {
          tenantId: testTenant.id,
          active: true
        }
      });
      
      assert.ok(activeServices.every(s => s.active === true));
    });

    it('DEVE atualizar preço do serviço', async () => {
      const updated = await prisma.service.update({
        where: { id: service.id },
        data: { price: 99.90 }
      });
      
      assert.strictEqual(updated.price, 99.90);
    });
  });

  describe('PromotionRepository (via Prisma)', () => {
    let promotion;

    before(async () => {
      promotion = await createTestPromotion(testTenant.id);
    });

    after(async () => {
      if (promotion?.id) {
        try {
          await prisma.promotion.delete({ where: { id: promotion.id } });
        } catch (e) {
          // Já pode ter sido deletado
        }
      }
    });

    it('DEVE criar promoção com desconto fixo', async () => {
      const newPromo = await createTestPromotion(testTenant.id, {
        name: 'Promoção Fixa',
        discountType: 'FIXED',
        discountValue: 25.00
      });
      
      assert.ok(newPromo.id);
      assert.strictEqual(newPromo.discountType, 'FIXED');
      
      await prisma.promotion.delete({ where: { id: newPromo.id } });
    });

    it('DEVE filtrar promoções ativas', async () => {
      const activePromos = await prisma.promotion.findMany({
        where: {
          tenantId: testTenant.id,
          active: true
        }
      });
      
      assert.ok(activePromos.every(p => p.active === true));
    });

    it('DEVE atualizar valor do desconto', async () => {
      const updated = await prisma.promotion.update({
        where: { id: promotion.id },
        data: { discountValue: 30 }
      });
      
      assert.strictEqual(updated.discountValue, 30);
    });

    it('DEVE filtrar promoções por tipo', async () => {
      const percentagePromos = await prisma.promotion.findMany({
        where: {
          tenantId: testTenant.id,
          discountType: 'PERCENTAGE'
        }
      });
      
      assert.ok(percentagePromos.every(p => p.discountType === 'PERCENTAGE'));
    });

    it('DEVE verificar datas de vigência', async () => {
      const now = new Date();
      const validPromos = await prisma.promotion.findMany({
        where: {
          tenantId: testTenant.id,
          active: true,
          startDate: { lte: now },
          endDate: { gte: now }
        }
      });
      
      assert.ok(validPromos.every(p => 
        p.startDate <= now && p.endDate >= now
      ));
    });
  });
});
