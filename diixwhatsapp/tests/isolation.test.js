/**
 * Teste Crítico de Isolamento Multi-Tenant
 * 
 * Este teste verifica se um Tenant NÃO consegue acessar dados de outro Tenant
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

describe('Isolamento Multi-Tenant', () => {
  let tenantA, tenantB;
  let userA, userB;
  let productA, productB;
  let clientA, clientB;

  before(async () => {
    console.log('\n=== Setup: Criando dados para teste de isolamento ===\n');
    
    // Criar Tenant A
    tenantA = await prisma.tenant.create({
      data: {
        name: 'Loja A - Teste Isolamento',
        slug: 'loja-a-teste-' + Date.now(),
        email: 'loja.a@teste.com',
        active: true
      }
    });

    // Criar Tenant B
    tenantB = await prisma.tenant.create({
      data: {
        name: 'Loja B - Teste Isolamento',
        slug: 'loja-b-teste-' + Date.now(),
        email: 'loja.b@teste.com',
        active: true
      }
    });

    // Criar usuário para Tenant A
    const passwordHash = await bcrypt.hash('senha123', 10);
    userA = await prisma.user.create({
      data: {
        tenantId: tenantA.id,
        username: 'usuario_a',
        email: 'usuario.a@teste.com',
        passwordHash,
        name: 'Usuário Loja A',
        role: 'TENANT_ADMIN',
        active: true
      }
    });

    // Criar usuário para Tenant B
    userB = await prisma.user.create({
      data: {
        tenantId: tenantB.id,
        username: 'usuario_b',
        email: 'usuario.b@teste.com',
        passwordHash,
        name: 'Usuário Loja B',
        role: 'TENANT_ADMIN',
        active: true
      }
    });

    // Criar Produto A (pertence ao Tenant A)
    productA = await prisma.product.create({
      data: {
        tenantId: tenantA.id,
        name: 'Produto Exclusivo Loja A',
        slug: 'produto-loja-a',
        price: 99.90,
        stock: 10,
        active: true
      }
    });

    // Criar Produto B (pertence ao Tenant B)
    productB = await prisma.product.create({
      data: {
        tenantId: tenantB.id,
        name: 'Produto Exclusivo Loja B',
        slug: 'produto-loja-b',
        price: 149.90,
        stock: 5,
        active: true
      }
    });

    // Criar Cliente A
    clientA = await prisma.client.create({
      data: {
        tenantId: tenantA.id,
        name: 'Cliente Loja A',
        email: 'cliente.a@teste.com',
        active: true
      }
    });

    // Criar Cliente B
    clientB = await prisma.client.create({
      data: {
        tenantId: tenantB.id,
        name: 'Cliente Loja B',
        email: 'cliente.b@teste.com',
        active: true
      }
    });

    console.log('Tenant A ID:', tenantA.id);
    console.log('Tenant B ID:', tenantB.id);
    console.log('Produto A ID:', productA.id, '- Tenant:', productA.tenantId);
    console.log('Produto B ID:', productB.id, '- Tenant:', productB.tenantId);
    console.log('\n=== Setup concluído ===\n');
  });

  after(async () => {
    console.log('\n=== Cleanup: Removendo dados de teste ===\n');
    
    // Remover produtos
    await prisma.product.deleteMany({
      where: {
        id: { in: [productA.id, productB.id] }
      }
    });

    // Remover clientes
    await prisma.client.deleteMany({
      where: {
        id: { in: [clientA.id, clientB.id] }
      }
    });

    // Remover usuários
    await prisma.user.deleteMany({
      where: {
        id: { in: [userA.id, userB.id] }
      }
    });

    // Remover tenants
    await prisma.tenant.deleteMany({
      where: {
        id: { in: [tenantA.id, tenantB.id] }
      }
    });

    console.log('=== Cleanup concluído ===\n');
  });

  it('DEVE retornar null quando Tenant A tentar buscar produto do Tenant B pelo repositório', async () => {
    // Simular busca do produto B usando tenantId do Tenant A
    const productFromBWithA = await prisma.product.findFirst({
      where: {
        id: productB.id,
        tenantId: tenantA.id // Tentando acessar com tenantId errado
      }
    });

    assert.strictEqual(productFromBWithA, null, 
      'Produto do Tenant B não deve ser acessível ao Tenant A');
  });

  it('DEVE retornar produto quando buscar com tenantId correto', async () => {
    const productFromA = await prisma.product.findFirst({
      where: {
        id: productA.id,
        tenantId: tenantA.id
      }
    });

    assert.notStrictEqual(productFromA, null, 
      'Produto deve ser acessível com tenantId correto');
    assert.strictEqual(productFromA.name, 'Produto Exclusivo Loja A');
  });

  it('DEVE contar apenas produtos do Tenant A quando filtrado por tenantId', async () => {
    const countA = await prisma.product.count({
      where: { tenantId: tenantA.id }
    });

    const countB = await prisma.product.count({
      where: { tenantId: tenantB.id }
    });

    assert.strictEqual(countA, 1, 'Tenant A deve ter apenas 1 produto');
    assert.strictEqual(countB, 1, 'Tenant B deve ter apenas 1 produto');
  });

  it('DEVE retornar null quando Tenant B tentar acessar cliente do Tenant A', async () => {
    const clientFromAWithB = await prisma.client.findFirst({
      where: {
        id: clientA.id,
        tenantId: tenantB.id // Tenant errado
      }
    });

    assert.strictEqual(clientFromAWithB, null, 
      'Cliente do Tenant A não deve ser acessível ao Tenant B');
  });

  it('DEVE listar apenas clientes do Tenant A quando filtrado', async () => {
    const clientsA = await prisma.client.findMany({
      where: { tenantId: tenantA.id }
    });

    const clientsB = await prisma.client.findMany({
      where: { tenantId: tenantB.id }
    });

    assert.strictEqual(clientsA.length, 1, 'Tenant A deve ter 1 cliente');
    assert.strictEqual(clientsA[0].name, 'Cliente Loja A');
    
    assert.strictEqual(clientsB.length, 1, 'Tenant B deve ter 1 cliente');
    assert.strictEqual(clientsB[0].name, 'Cliente Loja B');
    
    // Verificar que são clientes diferentes
    assert.notStrictEqual(clientsA[0].id, clientsB[0].id);
  });

  it('NÃO DEVE permitir update de produto de outro tenant', async () => {
    // Tentar atualizar produto B com tenantId do Tenant A
    const updated = await prisma.product.updateMany({
      where: {
        id: productB.id,
        tenantId: tenantA.id // Tenant errado
      },
      data: {
        name: 'Nome Hackeado'
      }
    });

    assert.strictEqual(updated.count, 0, 
      'Update não deve afetar nenhum registro com tenantId errado');

    // Verificar que o produto B permanece inalterado
    const productBAfter = await prisma.product.findUnique({
      where: { id: productB.id }
    });

    assert.strictEqual(productBAfter.name, 'Produto Exclusivo Loja B',
      'Produto B não deve ser alterado por Tenant A');
  });

  it('NÃO DEVE permitir delete de produto de outro tenant', async () => {
    // Tentar deletar produto B com tenantId do Tenant A
    const deleted = await prisma.product.deleteMany({
      where: {
        id: productB.id,
        tenantId: tenantA.id // Tenant errado
      }
    });

    assert.strictEqual(deleted.count, 0, 
      'Delete não deve afetar nenhum registro com tenantId errado');

    // Verificar que o produto B ainda existe
    const productBAfter = await prisma.product.findUnique({
      where: { id: productB.id }
    });

    assert.notStrictEqual(productBAfter, null, 
      'Produto B deve continuar existindo');
  });

  it('DEVE isolar serviços por tenant', async () => {
    const serviceA = await prisma.service.create({
      data: {
        tenantId: tenantA.id,
        name: 'Serviço Loja A',
        price: 50.00,
        active: true
      }
    });

    const serviceB = await prisma.service.create({
      data: {
        tenantId: tenantB.id,
        name: 'Serviço Loja B',
        price: 75.00,
        active: true
      }
    });

    // Tentar acessar serviço B com tenant A
    const serviceFromBWithA = await prisma.service.findFirst({
      where: {
        id: serviceB.id,
        tenantId: tenantA.id
      }
    });

    assert.strictEqual(serviceFromBWithA, null,
      'Serviço do Tenant B não deve ser acessível ao Tenant A');

    // Cleanup
    await prisma.service.deleteMany({
      where: { id: { in: [serviceA.id, serviceB.id] } }
    });
  });

  it('DEVE isolar promoções por tenant', async () => {
    const promoA = await prisma.promotion.create({
      data: {
        tenantId: tenantA.id,
        name: 'Promoção Loja A',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        active: true
      }
    });

    const promoB = await prisma.promotion.create({
      data: {
        tenantId: tenantB.id,
        name: 'Promoção Loja B',
        discountType: 'FIXED',
        discountValue: 20,
        active: true
      }
    });

    // Contar promoções por tenant
    const countA = await prisma.promotion.count({
      where: { tenantId: tenantA.id }
    });

    const countB = await prisma.promotion.count({
      where: { tenantId: tenantB.id }
    });

    assert.strictEqual(countA, 1, 'Tenant A deve ter 1 promoção');
    assert.strictEqual(countB, 1, 'Tenant B deve ter 1 promoção');

    // Cleanup
    await prisma.promotion.deleteMany({
      where: { id: { in: [promoA.id, promoB.id] } }
    });
  });
});
