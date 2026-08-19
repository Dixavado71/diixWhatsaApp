import { z } from 'zod';

/**
 * Tenant validation schemas
 */

export const createTenantSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .max(100, 'Slug muito longo')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional()
    .nullable(),
  email: z
    .string()
    .email('E-mail inválido')
    .max(100, 'E-mail muito longo')
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(20, 'Telefone muito longo')
    .optional()
    .nullable(),
  document: z
    .string()
    .max(20, 'Documento muito longo')
    .optional()
    .nullable(),
  address: z
    .string()
    .max(200, 'Endereço muito longo')
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100, 'Cidade muito longa')
    .optional()
    .nullable(),
  state: z
    .string()
    .max(2, 'Estado deve ter 2 caracteres')
    .optional()
    .nullable(),
  zipCode: z
    .string()
    .max(20, 'CEP muito longo')
    .optional()
    .nullable(),
  logo: z
    .string()
    .url('Logo deve ser uma URL válida')
    .optional()
    .nullable(),
  active: z
    .boolean()
    .optional()
    .default(true)
});

export const updateTenantSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .optional(),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .max(100, 'Slug muito longo')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug deve conter apenas letras minúsculas, números e hífens')
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional()
    .nullable(),
  email: z
    .string()
    .email('E-mail inválido')
    .max(100, 'E-mail muito longo')
    .optional()
    .nullable(),
  phone: z
    .string()
    .max(20, 'Telefone muito longo')
    .optional()
    .nullable(),
  document: z
    .string()
    .max(20, 'Documento muito longo')
    .optional()
    .nullable(),
  address: z
    .string()
    .max(200, 'Endereço muito longo')
    .optional()
    .nullable(),
  city: z
    .string()
    .max(100, 'Cidade muito longa')
    .optional()
    .nullable(),
  state: z
    .string()
    .max(2, 'Estado deve ter 2 caracteres')
    .optional()
    .nullable(),
  zipCode: z
    .string()
    .max(20, 'CEP muito longo')
    .optional()
    .nullable(),
  logo: z
    .string()
    .url('Logo deve ser uma URL válida')
    .optional()
    .nullable(),
  active: z
    .boolean()
    .optional()
});
