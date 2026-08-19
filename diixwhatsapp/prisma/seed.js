import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { config } from '../src/config/env.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Check if master user already exists
  const existingMaster = await prisma.user.findFirst({
    where: { role: 'MASTER' }
  });

  if (existingMaster) {
    console.log('⚠️  Master user already exists. Skipping seed.');
    return;
  }

  // Create Master User
  const masterPasswordHash = await bcrypt.hash(config.masterPassword, 12);
  
  const masterUser = await prisma.user.create({
    data: {
      username: config.masterUsername,
      email: config.masterEmail,
      passwordHash: masterPasswordHash,
      name: 'Admin Master',
      role: 'MASTER',
      active: true
    }
  });

  console.log(`✅ Master user created: ${config.masterUsername}`);

  // Create Demo Tenants
  const tenantA = await prisma.tenant.create({
    data: {
      name: 'Loja A - Exemplo',
      slug: 'loja-a-exemplo',
      description: 'Loja de demonstração A',
      email: 'contato@lojaa.com.br',
      phone: '(11) 99999-1111',
      document: '00.000.000/0001-11',
      address: 'Rua das Flores, 123',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01000-000',
      active: true
    }
  });

  const tenantB = await prisma.tenant.create({
    data: {
      name: 'Loja B - Exemplo',
      slug: 'loja-b-exemplo',
      description: 'Loja de demonstração B',
      email: 'contato@lojab.com.br',
      phone: '(11) 99999-2222',
      document: '00.000.000/0001-22',
      address: 'Av. Paulista, 456',
      city: 'São Paulo',
      state: 'SP',
      zipCode: '01310-100',
      active: true
    }
  });

  console.log('✅ Demo tenants created');

  // Create Tenant Users
  const tenantAdminAPassword = await bcrypt.hash('senha123', 12);
  const tenantAdminBPassword = await bcrypt.hash('senha123', 12);
  const tenantUserAPassword = await bcrypt.hash('senha123', 12);

  await prisma.user.create({
    data: {
      username: 'admin-loja-a',
      email: 'admin@lojaa.com.br',
      passwordHash: tenantAdminAPassword,
      name: 'Admin Loja A',
      role: 'TENANT_ADMIN',
      tenantId: tenantA.id,
      active: true
    }
  });

  await prisma.user.create({
    data: {
      username: 'admin-loja-b',
      email: 'admin@lojab.com.br',
      passwordHash: tenantAdminBPassword,
      name: 'Admin Loja B',
      role: 'TENANT_ADMIN',
      tenantId: tenantB.id,
      active: true
    }
  });

  await prisma.user.create({
    data: {
      username: 'usuario-loja-a',
      email: 'usuario@lojaa.com.br',
      passwordHash: tenantUserAPassword,
      name: 'Usuário Loja A',
      role: 'TENANT_USER',
      tenantId: tenantA.id,
      active: true
    }
  });

  console.log('✅ Tenant users created');

  // Create Products for Tenant A
  await prisma.product.createMany({
    data: [
      {
        tenantId: tenantA.id,
        name: 'Produto A1',
        slug: 'produto-a1',
        description: 'Produto de exemplo da Loja A',
        sku: 'PROD-A1-001',
        price: 99.90,
        costPrice: 50.00,
        stock: 100,
        active: true
      },
      {
        tenantId: tenantA.id,
        name: 'Produto A2',
        slug: 'produto-a2',
        description: 'Outro produto da Loja A',
        sku: 'PROD-A2-002',
        price: 149.90,
        costPrice: 75.00,
        stock: 50,
        active: true
      }
    ]
  });

  // Create Products for Tenant B
  await prisma.product.createMany({
    data: [
      {
        tenantId: tenantB.id,
        name: 'Produto B1',
        slug: 'produto-b1',
        description: 'Produto de exemplo da Loja B',
        sku: 'PROD-B1-001',
        price: 199.90,
        costPrice: 100.00,
        stock: 75,
        active: true
      },
      {
        tenantId: tenantB.id,
        name: 'Produto B2',
        slug: 'produto-b2',
        description: 'Outro produto da Loja B',
        sku: 'PROD-B2-002',
        price: 249.90,
        costPrice: 125.00,
        stock: 30,
        active: true
      }
    ]
  });

  console.log('✅ Products created');

  // Create Clients for Tenant A
  await prisma.client.createMany({
    data: [
      {
        tenantId: tenantA.id,
        name: 'Cliente A1',
        email: 'cliente1@lojaa.com.br',
        phone: '(11) 91111-1111',
        document: '111.111.111-11',
        address: 'Rua do Cliente A1, 100',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01001-000',
        active: true
      },
      {
        tenantId: tenantA.id,
        name: 'Cliente A2',
        email: 'cliente2@lojaa.com.br',
        phone: '(11) 92222-2222',
        document: '222.222.222-22',
        address: 'Rua do Cliente A2, 200',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01002-000',
        active: true
      }
    ]
  });

  // Create Clients for Tenant B
  await prisma.client.createMany({
    data: [
      {
        tenantId: tenantB.id,
        name: 'Cliente B1',
        email: 'cliente1@lojab.com.br',
        phone: '(11) 93333-3333',
        document: '333.333.333-33',
        address: 'Rua do Cliente B1, 300',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01003-000',
        active: true
      }
    ]
  });

  console.log('✅ Clients created');

  // Create Services for Tenant A
  await prisma.service.createMany({
    data: [
      {
        tenantId: tenantA.id,
        name: 'Serviço A1',
        description: 'Serviço de exemplo da Loja A',
        price: 150.00,
        duration: 60,
        active: true
      },
      {
        tenantId: tenantA.id,
        name: 'Serviço A2',
        description: 'Outro serviço da Loja A',
        price: 200.00,
        duration: 90,
        active: true
      }
    ]
  });

  // Create Services for Tenant B
  await prisma.service.createMany({
    data: [
      {
        tenantId: tenantB.id,
        name: 'Serviço B1',
        description: 'Serviço de exemplo da Loja B',
        price: 180.00,
        duration: 45,
        active: true
      }
    ]
  });

  console.log('✅ Services created');

  // Create Promotions for Tenant A
  const now = new Date();
  const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  await prisma.promotion.createMany({
    data: [
      {
        tenantId: tenantA.id,
        name: 'Promoção A1 - 10% OFF',
        description: 'Desconto de 10% em produtos selecionados',
        discountType: 'PERCENTAGE',
        discountValue: 10.00,
        startDate: now,
        endDate: futureDate,
        active: true
      },
      {
        tenantId: tenantA.id,
        name: 'Promoção A2 - R$ 20 OFF',
        description: 'Desconto fixo de R$ 20,00',
        discountType: 'FIXED',
        discountValue: 20.00,
        startDate: now,
        endDate: futureDate,
        active: true
      }
    ]
  });

  // Create Promotions for Tenant B
  await prisma.promotion.createMany({
    data: [
      {
        tenantId: tenantB.id,
        name: 'Promoção B1 - 15% OFF',
        description: 'Desconto de 15% em toda loja',
        discountType: 'PERCENTAGE',
        discountValue: 15.00,
        startDate: now,
        endDate: futureDate,
        active: true
      }
    ]
  });

  console.log('✅ Promotions created');

  // Create Audit Log for seed
  await prisma.auditLog.create({
    data: {
      userId: masterUser.id,
      action: 'SEED_EXECUTED',
      entity: 'SYSTEM',
      ip: '127.0.0.1',
      userAgent: 'seed-script'
    }
  });

  console.log('✅ Seed completed successfully!');
  console.log('\n📋 Demo Credentials:');
  console.log('├─ Master:');
  console.log(`│  ├─ Username: ${config.masterUsername}`);
  console.log(`│  └─ Password: ${config.masterPassword}`);
  console.log('├─ Tenant A Admin:');
  console.log('│  ├─ Username: admin-loja-a');
  console.log('│  └─ Password: senha123');
  console.log('├─ Tenant B Admin:');
  console.log('│  ├─ Username: admin-loja-b');
  console.log('│  └─ Password: senha123');
  console.log('└─ Tenant A User:');
  console.log('     ├─ Username: usuario-loja-a');
  console.log('     └─ Password: senha123');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
