/**
 * Configuração Global dos Testes
 * Setup de ambiente e utilitários compartilhados
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

// Instância global do Prisma para reutilização nos testes
export const prisma = new PrismaClient();

/**
 * Cria um tenant de teste com dados padrão
 */
export async function createTestTenant(overrides = {}) {
  const timestamp = Date.now();
  return await prisma.tenant.create({
    data: {
      name: `Tenant Teste ${timestamp}`,
      slug: `tenant-teste-${timestamp}`,
      email: `tenant${timestamp}@teste.com`,
      active: true,
      ...overrides
    }
  });
}

/**
 * Cria um usuário de teste
 */
export async function createTestUser(overrides = {}) {
  const timestamp = Date.now();
  const passwordHash = await bcrypt.hash('senha123', 10);
  
  return await prisma.user.create({
    data: {
      tenantId: overrides.tenantId || null,
      username: `usuario_${timestamp}`,
      email: `usuario${timestamp}@teste.com`,
      passwordHash,
      name: 'Usuário Teste',
      role: overrides.role || 'TENANT_ADMIN',
      active: true,
      ...overrides
    }
  });
}

/**
 * Cria um cliente de teste
 */
export async function createTestClient(tenantId, overrides = {}) {
  const timestamp = Date.now();
  return await prisma.client.create({
    data: {
      tenantId,
      name: `Cliente Teste ${timestamp}`,
      email: `cliente${timestamp}@teste.com`,
      phone: '(11) 99999-9999',
      active: true,
      ...overrides
    }
  });
}

/**
 * Cria um produto de teste
 */
export async function createTestProduct(tenantId, overrides = {}) {
  const timestamp = Date.now();
  return await prisma.product.create({
    data: {
      tenantId,
      name: `Produto Teste ${timestamp}`,
      slug: `produto-teste-${timestamp}`,
      price: 99.90,
      stock: 10,
      active: true,
      ...overrides
    }
  });
}

/**
 * Cria um serviço de teste
 */
export async function createTestService(tenantId, overrides = {}) {
  const timestamp = Date.now();
  return await prisma.service.create({
    data: {
      tenantId,
      name: `Serviço Teste ${timestamp}`,
      description: 'Descrição do serviço de teste',
      price: 50.00,
      active: true,
      ...overrides
    }
  });
}

/**
 * Cria uma promoção de teste
 */
export async function createTestPromotion(tenantId, overrides = {}) {
  const timestamp = Date.now();
  return await prisma.promotion.create({
    data: {
      tenantId,
      name: `Promoção Teste ${timestamp}`,
      discountType: 'PERCENTAGE',
      discountValue: 10,
      active: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 dias
      ...overrides
    }
  });
}

/**
 * Limpa todos os dados de teste do banco
 * Ordem importante devido às foreign keys
 */
export async function cleanupTestData(data) {
  const { promotions, services, products, clients, users, tenants } = data;
  
  try {
    if (promotions?.length) {
      await prisma.promotion.deleteMany({
        where: { id: { in: promotions.map(p => p.id) } }
      });
    }
    
    if (services?.length) {
      await prisma.service.deleteMany({
        where: { id: { in: services.map(s => s.id) } }
      });
    }
    
    if (products?.length) {
      await prisma.product.deleteMany({
        where: { id: { in: products.map(p => p.id) } }
      });
    }
    
    if (clients?.length) {
      await prisma.client.deleteMany({
        where: { id: { in: clients.map(c => c.id) } }
      });
    }
    
    if (users?.length) {
      await prisma.user.deleteMany({
        where: { id: { in: users.map(u => u.id) } }
      });
    }
    
    if (tenants?.length) {
      await prisma.tenant.deleteMany({
        where: { id: { in: tenants.map(t => t.id) } }
      });
    }
  } catch (error) {
    console.error('Erro no cleanup:', error);
  }
}

/**
 * Simula uma sessão de usuário para testes de autenticação
 */
export function mockSession(user) {
  return {
    userId: user.id,
    tenantId: user.tenantId,
    userRole: user.role,
    username: user.username
  };
}

/**
 * Aguarda um tempo em milissegundos
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
