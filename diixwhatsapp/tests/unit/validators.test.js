/**
 * Testes de Validação com Zod
 * Testa os schemas de validação de dados
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import { z } from 'zod';

describe('Validações Zod', () => {
  
  describe('Schema de Login', () => {
    const loginSchema = z.object({
      email: z.string().email('Email inválido'),
      password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres')
    });

    it('DEVE validar login com dados corretos', () => {
      const data = {
        email: 'usuario@diixwhatsapp.com',
        password: 'senha123'
      };
      
      const result = loginSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });

    it('DEVE falhar com email inválido', () => {
      const data = {
        email: 'email-invalido',
        password: 'senha123'
      };
      
      const result = loginSchema.safeParse(data);
      assert.strictEqual(result.success, false);
    });

    it('DEVE falhar com senha curta', () => {
      const data = {
        email: 'usuario@diixwhatsapp.com',
        password: '12345'
      };
      
      const result = loginSchema.safeParse(data);
      assert.strictEqual(result.success, false);
    });
  });

  describe('Schema de Tenant', () => {
    const tenantSchema = z.object({
      name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
      slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
      email: z.string().email('Email inválido'),
      active: z.boolean().default(true)
    });

    it('DEVE validar tenant com dados corretos', () => {
      const data = {
        name: 'Minha Loja',
        slug: 'minha-loja',
        email: 'contato@loja.com',
        active: true
      };
      
      const result = tenantSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });

    it('DEVE falhar com slug inválido', () => {
      const data = {
        name: 'Minha Loja',
        slug: 'Minha_Loja_Invalida',
        email: 'contato@loja.com'
      };
      
      const result = tenantSchema.safeParse(data);
      assert.strictEqual(result.success, false);
    });

    it('DEVE falhar com nome curto', () => {
      const data = {
        name: 'ML',
        slug: 'ml',
        email: 'contato@loja.com'
      };
      
      const result = tenantSchema.safeParse(data);
      assert.strictEqual(result.success, false);
    });
  });

  describe('Schema de Usuário', () => {
    const userSchema = z.object({
      username: z.string().min(3, 'Username deve ter no mínimo 3 caracteres'),
      email: z.string().email('Email inválido'),
      name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
      role: z.enum(['ADMIN', 'TENANT_ADMIN', 'TENANT_USER']),
      active: z.boolean().default(true)
    });

    it('DEVE validar usuário com dados corretos', () => {
      const data = {
        username: 'joao_silva',
        email: 'joao@diixwhatsapp.com',
        name: 'João Silva',
        role: 'TENANT_ADMIN',
        active: true
      };
      
      const result = userSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });

    it('DEVE falhar com role inválida', () => {
      const data = {
        username: 'joao_silva',
        email: 'joao@diixwhatsapp.com',
        name: 'João Silva',
        role: 'INVALID_ROLE'
      };
      
      const result = userSchema.safeParse(data);
      assert.strictEqual(result.success, false);
    });

    it('DEVE validar todos os roles válidos', () => {
      const roles = ['ADMIN', 'TENANT_ADMIN', 'TENANT_USER'];
      
      roles.forEach(role => {
        const data = {
          username: 'test_user',
          email: 'test@diixwhatsapp.com',
          name: 'Test User',
          role: role
        };
        
        const result = userSchema.safeParse(data);
        assert.strictEqual(result.success, true, `Role ${role} deve ser válido`);
      });
    });
  });

  describe('Schema de Produto', () => {
    const productSchema = z.object({
      name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
      slug: z.string().regex(/^[a-z0-9-]+$/),
      price: z.number().positive('Preço deve ser positivo'),
      stock: z.number().int().nonnegative('Estoque não pode ser negativo'),
      active: z.boolean().default(true)
    });

    it('DEVE validar produto com dados corretos', () => {
      const data = {
        name: 'Produto Teste',
        slug: 'produto-teste',
        price: 99.90,
        stock: 10,
        active: true
      };
      
      const result = productSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });

    it('DEVE falhar com preço negativo', () => {
      const data = {
        name: 'Produto Teste',
        slug: 'produto-teste',
        price: -10,
        stock: 10
      };
      
      const result = productSchema.safeParse(data);
      assert.strictEqual(result.success, false);
    });

    it('DEVE falhar com estoque negativo', () => {
      const data = {
        name: 'Produto Teste',
        slug: 'produto-teste',
        price: 99.90,
        stock: -5
      };
      
      const result = productSchema.safeParse(data);
      assert.strictEqual(result.success, false);
    });

    it('DEVE aceitar estoque zero', () => {
      const data = {
        name: 'Produto Teste',
        slug: 'produto-teste',
        price: 99.90,
        stock: 0
      };
      
      const result = productSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });
  });

  describe('Schema de Cliente', () => {
    const clientSchema = z.object({
      name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
      email: z.string().email('Email inválido').optional(),
      phone: z.string().optional(),
      active: z.boolean().default(true)
    });

    it('DEVE validar cliente com dados completos', () => {
      const data = {
        name: 'Cliente Teste',
        email: 'cliente@teste.com',
        phone: '(11) 99999-9999',
        active: true
      };
      
      const result = clientSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });

    it('DEVE validar cliente apenas com nome', () => {
      const data = {
        name: 'Cliente Teste'
      };
      
      const result = clientSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });

    it('DEVE falhar com email inválido quando fornecido', () => {
      const data = {
        name: 'Cliente Teste',
        email: 'email-invalido'
      };
      
      const result = clientSchema.safeParse(data);
      assert.strictEqual(result.success, false);
    });
  });

  describe('Schema de Serviço', () => {
    const serviceSchema = z.object({
      name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
      description: z.string().optional(),
      price: z.number().positive('Preço deve ser positivo'),
      active: z.boolean().default(true)
    });

    it('DEVE validar serviço com dados corretos', () => {
      const data = {
        name: 'Serviço Teste',
        description: 'Descrição do serviço',
        price: 150.00,
        active: true
      };
      
      const result = serviceSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });

    it('DEVE validar serviço sem descrição', () => {
      const data = {
        name: 'Serviço Teste',
        price: 150.00
      };
      
      const result = serviceSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });
  });

  describe('Schema de Promoção', () => {
    const promotionSchema = z.object({
      name: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
      discountType: z.enum(['PERCENTAGE', 'FIXED']),
      discountValue: z.number().positive('Valor do desconto deve ser positivo'),
      active: z.boolean().default(true),
      startDate: z.date().optional(),
      endDate: z.date().optional()
    });

    it('DEVE validar promoção com dados corretos', () => {
      const data = {
        name: 'Promoção Verão',
        discountType: 'PERCENTAGE',
        discountValue: 20,
        active: true
      };
      
      const result = promotionSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });

    it('DEVE validar promoção com desconto fixo', () => {
      const data = {
        name: 'Promoção Fixa',
        discountType: 'FIXED',
        discountValue: 50.00,
        active: true
      };
      
      const result = promotionSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });

    it('DEVE falhar com tipo de desconto inválido', () => {
      const data = {
        name: 'Promoção Inválida',
        discountType: 'INVALID',
        discountValue: 20
      };
      
      const result = promotionSchema.safeParse(data);
      assert.strictEqual(result.success, false);
    });

    it('DEVE validar promoção com datas de vigência', () => {
      const now = new Date();
      const endDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const data = {
        name: 'Promoção Semanal',
        discountType: 'PERCENTAGE',
        discountValue: 15,
        active: true,
        startDate: now,
        endDate: endDate
      };
      
      const result = promotionSchema.safeParse(data);
      assert.strictEqual(result.success, true);
    });
  });
});
