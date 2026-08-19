import { z } from 'zod';

/**
 * Authentication validation schemas
 * Only includes schemas directly related to authentication flow
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
