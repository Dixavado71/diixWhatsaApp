import { z } from 'zod';

/**
 * Authentication validation schemas
 */

export const loginSchema = z.object({
  identifier: z
    .string()
    .min(1, 'Usuário ou e-mail é obrigatório')
    .max(100, 'Usuário ou e-mail muito longo'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .max(100, 'Senha muito longa')
});

export const changePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Senha atual é obrigatória'),
  newPassword: z
    .string()
    .min(6, 'A nova senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword']
});

export const createTenantUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Usuário deve ter pelo menos 3 caracteres')
    .max(50, 'Usuário muito longo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Usuário pode conter apenas letras, números, _ e -'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(100, 'E-mail muito longo'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  role: z
    .enum(['TENANT_ADMIN', 'TENANT_USER'], {
      errorMap: () => ({ message: 'Cargo inválido' })
    }),
  active: z
    .boolean()
    .optional()
    .default(true)
});

export const updateTenantUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .optional(),
  email: z
    .string()
    .email('E-mail inválido')
    .max(100, 'E-mail muito longo')
    .optional(),
  role: z
    .enum(['TENANT_ADMIN', 'TENANT_USER'], {
      errorMap: () => ({ message: 'Cargo inválido' })
    })
    .optional(),
  active: z
    .boolean()
    .optional()
});

export const createUserSchema = z.object({
  username: z
    .string()
    .min(3, 'Usuário deve ter pelo menos 3 caracteres')
    .max(50, 'Usuário muito longo')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Usuário pode conter apenas letras, números, _ e -'),
  email: z
    .string()
    .email('E-mail inválido')
    .max(100, 'E-mail muito longo'),
  password: z
    .string()
    .min(6, 'Senha deve ter pelo menos 6 caracteres')
    .max(100, 'Senha muito longa'),
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  role: z
    .enum(['MASTER', 'TENANT_ADMIN', 'TENANT_USER'], {
      errorMap: () => ({ message: 'Cargo inválido' })
    }),
  tenantId: z
    .string()
    .cuid('ID do Tenant inválido')
    .optional()
    .nullable(),
  active: z
    .boolean()
    .optional()
    .default(true)
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .optional(),
  email: z
    .string()
    .email('E-mail inválido')
    .max(100, 'E-mail muito longo')
    .optional(),
  role: z
    .enum(['MASTER', 'TENANT_ADMIN', 'TENANT_USER'], {
      errorMap: () => ({ message: 'Cargo inválido' })
    })
    .optional(),
  active: z
    .boolean()
    .optional()
});
