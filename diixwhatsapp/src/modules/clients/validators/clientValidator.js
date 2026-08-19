import { z } from 'zod';

/**
 * Client validation schemas
 */

export const createClientSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
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
  notes: z
    .string()
    .max(1000, 'Observações muito longas')
    .optional()
    .nullable(),
  active: z
    .boolean()
    .optional()
    .default(true)
});

export const updateClientSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .optional(),
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
  notes: z
    .string()
    .max(1000, 'Observações muito longas')
    .optional()
    .nullable(),
  active: z
    .boolean()
    .optional()
});
