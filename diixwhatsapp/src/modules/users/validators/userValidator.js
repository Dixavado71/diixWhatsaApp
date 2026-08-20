import { z } from 'zod';
import { passwordSchema } from '../../../shared/helpers/password.js';

/**
 * User validation schemas
 */

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
  password: passwordSchema,
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

