import { z } from 'zod';

/**
 * Service validation schemas
 */

export const createServiceSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional()
    .nullable(),
  price: z
    .string()
    .or(z.number())
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Preço deve ser um número válido maior ou igual a zero'),
  duration: z
    .string()
    .or(z.number())
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0, 'Duração deve ser um número inteiro válido maior ou igual a zero')
    .optional()
    .nullable(),
  active: z
    .boolean()
    .optional()
    .default(true)
});

export const updateServiceSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo')
    .optional(),
  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional()
    .nullable(),
  price: z
    .string()
    .or(z.number())
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Preço deve ser um número válido maior ou igual a zero')
    .optional(),
  duration: z
    .string()
    .or(z.number())
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0, 'Duração deve ser um número inteiro válido maior ou igual a zero')
    .optional()
    .nullable(),
  active: z
    .boolean()
    .optional()
});
