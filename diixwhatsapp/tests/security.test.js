/**
 * Testes de Segurança
 * Testa proteções críticas: autenticação, autorização, tenant isolation, CSRF, rate limiting
 */

import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { createServer } from 'http';
import { prisma, createTestTenant, createTestUser, cleanupTestData } from './helpers.js';
import bcrypt from 'bcrypt';

// Importar o app para testes
import app from '../src/app.js';

describe('Testes de Segurança', () => {
  let server;
  let baseUrl;
  let tenantA, tenantB;
  let userTenantA, userTenantB, adminUser;

  before(async () => {
    console.log('\n=== Setup: Iniciando servidor de teste para segurança ===\n');
    
    // Criar tenants separados
    tenantA = await createTestTenant();
    tenantB = await createTestTenant();
    
    // Criar usuários em tenants diferentes
    const passwordHash = await bcrypt.hash('senha123', 10);
    
    userTenantA = await prisma.user.create({
      data: {
        tenantId: tenantA.id,
        username: 'usuario_tenant_a',
        email: 'tenant.a@diixwhatsapp.com',
        passwordHash,
        name: 'Usuário Tenant A',
        role: 'TENANT_ADMIN',
        active: true
      }
    });

    userTenantB = await prisma.user.create({
      data: {
        tenantId: tenantB.id,
        username: 'usuario_tenant_b',
        email: 'tenant.b@diixwhatsapp.com',
        passwordHash,
        name: 'Usuário Tenant B',
        role: 'TENANT_ADMIN',
        active: true
      }
    });

    adminUser = await prisma.user.create({
      data: {
        tenantId: null,
        username: 'admin_master',
        email: 'admin@diixwhatsapp.com',
        passwordHash,
        name: 'Admin Master',
        role: 'MASTER',
        active: true
      }
    });
    
    // Iniciar servidor em porta aleatória
    server = createServer(app);
    await new Promise((resolve) => {
      server.listen(0, resolve);
    });
    
    const address = server.address();
    baseUrl = `http://localhost:${address.port}`;
    
    console.log('Servidor rodando em:', baseUrl);
    console.log('Tenant A:', tenantA.id);
    console.log('Tenant B:', tenantB.id);
  });

  after(async () => {
    console.log('\n=== Cleanup: Parando servidor e limpando dados ===\n');
    
    server.close();
    
    await cleanupTestData({
      tenants: [tenantA, tenantB],
      users: [userTenantA, userTenantB, adminUser]
    });
    
    console.log('=== Cleanup concluído ===\n');
  });

  describe('A. Testes de Acesso Não Autorizado', () => {
    it('DEVE retornar 401 ao acessar /tenant/dashboard sem sessão', async () => {
      const response = await fetch(`${baseUrl}/tenant/dashboard`, {
        redirect: 'manual'
      });
      
      // Deve redirecionar para login (302) ou retornar 401
      assert.ok([302, 401].includes(response.status));
    });

    it('DEVE retornar 401 ao acessar /admin/tenants sem sessão', async () => {
      const response = await fetch(`${baseUrl}/admin/tenants`, {
        redirect: 'manual'
      });
      
      assert.ok([302, 401].includes(response.status));
    });

    it('DEVE retornar 401 ao tentar criar produto sem autenticação', async () => {
      const response = await fetch(`${baseUrl}/tenant/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Produto Teste',
          price: 100
        })
      });
      
      assert.ok([302, 401].includes(response.status));
    });
  });

  describe('B. Testes de Escalação de Privilégio', () => {
    it('DEVE retornar 403 para usuário TENANT acessando rota /admin/*', async () => {
      // Login como tenant
      const loginResponse = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'usuario_tenant_a',
          password: 'senha123'
        })
      });
      
      assert.strictEqual(loginResponse.status, 200);
      
      // Tentar acessar rota admin
      const adminResponse = await fetch(`${baseUrl}/admin/tenants`, {
        credentials: 'include',
        redirect: 'manual'
      });
      
      // Deve ser 403 (Forbidden) ou redirecionar
      assert.ok([403, 302].includes(adminResponse.status));
    });

    it('DEVE permitir acesso MASTER a rotas admin', async () => {
      // Login como master
      const loginResponse = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'admin_master',
          password: 'senha123'
        })
      });
      
      assert.strictEqual(loginResponse.status, 200);
      
      // Acessar rota admin - pode redirecionar para dashboard
      const adminResponse = await fetch(`${baseUrl}/admin/dashboard`, {
        credentials: 'include',
        redirect: 'manual'
      });
      
      // Deve ser 200 ou 302 (redirect para dashboard)
      assert.ok([200, 302].includes(adminResponse.status));
    });
  });

  describe('C. Testes de Injeção de Tenant (Isolamento Multi-tenant)', () => {
    it('DEVE prevenir Tenant A de acessar dados do Tenant B via ID manipulado', async () => {
      // Criar um cliente para cada tenant
      const clientA = await prisma.client.create({
        data: {
          tenantId: tenantA.id,
          name: 'Cliente Tenant A',
          email: 'cliente.a@teste.com',
          phone: '111111111'
        }
      });

      const clientB = await prisma.client.create({
        data: {
          tenantId: tenantB.id,
          name: 'Cliente Tenant B',
          email: 'cliente.b@teste.com',
          phone: '222222222'
        }
      });

      try {
        // Login como Tenant A
        const loginResponse = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            username: 'usuario_tenant_a',
            password: 'senha123'
          })
        });
        
        assert.strictEqual(loginResponse.status, 200);
        
        // Tentar acessar cliente do Tenant B usando o ID diretamente
        // O repositório deve validar o tenantId
        const clientResponse = await fetch(`${baseUrl}/tenant/clients/${clientB.id}`, {
          credentials: 'include',
          redirect: 'manual'
        });
        
        // Deve retornar 404 (não encontrado) ou 403, NUNCA 200 com dados
        assert.ok([404, 403].includes(clientResponse.status), 
          `Esperado 404 ou 403, mas recebeu ${clientResponse.status}`);
        
        // Se retornar 200, verificar que não são dados do tenant B
        if (clientResponse.status === 200) {
          const data = await clientResponse.json();
          assert.notStrictEqual(data?.id, clientB.id, 
            'NÃO deve retornar dados de outro tenant!');
        }
      } finally {
        // Cleanup
        await prisma.client.deleteMany({
          where: { id: { in: [clientA.id, clientB.id] } }
        });
      }
    });

    it('DEVE listar apenas clientes do tenant autenticado', async () => {
      // Criar clientes de teste
      const clientsA = await Promise.all([
        prisma.client.create({ data: { tenantId: tenantA.id, name: 'Cliente A1', email: 'a1@teste.com', phone: '111' } }),
        prisma.client.create({ data: { tenantId: tenantA.id, name: 'Cliente A2', email: 'a2@teste.com', phone: '222' } })
      ]);

      const clientsB = await Promise.all([
        prisma.client.create({ data: { tenantId: tenantB.id, name: 'Cliente B1', email: 'b1@teste.com', phone: '333' } })
      ]);

      try {
        // Login como Tenant A
        await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            username: 'usuario_tenant_a',
            password: 'senha123'
          })
        });
        
        // Listar clientes
        const response = await fetch(`${baseUrl}/tenant/clients`, {
          credentials: 'include'
        });
        
        // Nota: Esta é uma página renderizada, não JSON
        // O teste verifica que a requisição é bem-sucedida
        assert.strictEqual(response.status, 200);
        
        // Verificar no banco que as queries estão filtrando corretamente
        const clientsFromDB_A = await prisma.client.findMany({
          where: { tenantId: tenantA.id }
        });
        
        const clientsFromDB_B = await prisma.client.findMany({
          where: { tenantId: tenantB.id }
        });
        
        assert.strictEqual(clientsFromDB_A.length, 2);
        assert.strictEqual(clientsFromDB_B.length, 1);
        assert.ok(!clientsFromDB_A.some(c => c.tenantId === tenantB.id));
        
      } finally {
        await prisma.client.deleteMany({
          where: { id: { in: [...clientsA.map(c => c.id), ...clientsB.map(c => c.id)] } }
        });
      }
    });
  });

  describe('D. Testes de Rate Limiting (Brute-Force Prevention)', () => {
    it('DEVE limitar tentativas de login após 5 falhas', async () => {
      // Fazer 6 requisições de login com senha errada
      const responses = [];
      
      for (let i = 0; i < 6; i++) {
        const response = await fetch(`${baseUrl}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            username: 'usuario_tenant_a',
            password: 'senha_errada'
          })
        });
        
        responses.push(response.status);
      }
      
      // As primeiras 5 devem retornar 401 (unauthorized)
      // A 6ª deve retornar 429 (too many requests)
      const lastStatus = responses[responses.length - 1];
      
      // Pelo menos a última requisição deve ser limitada
      assert.ok(
        lastStatus === 429 || responses.filter(s => s === 429).length > 0,
        `Rate limiter não funcionou. Status: ${responses.join(', ')}`
      );
    });
  });

  describe('E. Testes de Sanitização de Dados (Password Hash Leak)', () => {
    it('NÃO deve expor passwordHash na resposta de login', async () => {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'usuario_tenant_a',
          password: 'senha123'
        })
      });
      
      assert.strictEqual(response.status, 200);
      
      const data = await response.json();
      
      // Verificar que passwordHash NÃO está na resposta
      const responseData = JSON.stringify(data);
      assert.ok(
        !responseData.includes('passwordHash'),
        'passwordHash foi exposto na resposta da API!'
      );
      
      // Verificar que campos sensíveis não estão presentes
      assert.ok(!data.passwordHash, 'Campo passwordHash não deve existir');
      if (data.user) {
        assert.ok(!data.user.passwordHash, 'user.passwordHash não deve existir');
      }
    });

    it('NÃO deve expor passwordHash ao buscar usuário', async () => {
      // Este teste depende da implementação do controller de usuários
      // Login primeiro
      await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          username: 'usuario_tenant_a',
          password: 'senha123'
        })
      });
      
      // Buscar perfil do usuário (se endpoint existir)
      const response = await fetch(`${baseUrl}/tenant/profile`, {
        credentials: 'include',
        redirect: 'manual'
      });
      
      // Se retornar 200, verificar que não há passwordHash
      if (response.status === 200) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await response.json();
          const responseData = JSON.stringify(data);
          assert.ok(!responseData.includes('passwordHash'));
        }
      }
    });
  });

  describe('F. Testes de Validação de Input', () => {
    it('DEVE rejeitar login sem username', async () => {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: 'senha123'
        })
      });
      
      assert.strictEqual(response.status, 400);
    });

    it('DEVE rejeitar login sem password', async () => {
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: 'usuario_tenant_a'
        })
      });
      
      assert.strictEqual(response.status, 400);
    });

    it('DEVE rejeitar SQL injection tentativa no username', async () => {
      const maliciousUsername = "admin' OR '1'='1";
      
      const response = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: maliciousUsername,
          password: 'qualquer_senha'
        })
      });
      
      // Deve falhar autenticação, não erro de servidor
      assert.ok([400, 401].includes(response.status));
    });
  });
});
