import { z } from 'zod';

/**
 * Product validation schemas
 */

export const createProductSchema = z.object({
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
    .max(1000, 'Descrição muito longa')
    .optional()
    .nullable(),
  sku: z
    .string()
    .max(50, 'SKU muito longo')
    .optional()
    .nullable(),
  price: z
    .string()
    .or(z.number())
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Preço deve ser um número válido maior ou igual a zero'),
  costPrice: z
    .string()
    .or(z.number())
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Custo deve ser um número válido maior ou igual a zero')
    .optional()
    .nullable(),
  stock: z
    .string()
    .or(z.number())
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0, 'Estoque deve ser um número inteiro válido maior ou igual a zero')
    .default(0),
  image: z
    .string()
    .url('Imagem deve ser uma URL válida')
    .optional()
    .nullable(),
  active: z
    .boolean()
    .optional()
    .default(true)
});

export const updateProductSchema = z.object({
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
    .max(1000, 'Descrição muito longa')
    .optional()
    .nullable(),
  sku: z
    .string()
    .max(50, 'SKU muito longo')
    .optional()
    .nullable(),
  price: z
    .string()
    .or(z.number())
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Preço deve ser um número válido maior ou igual a zero')
    .optional(),
  costPrice: z
    .string()
    .or(z.number())
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Custo deve ser um número válido maior ou igual a zero')
    .optional()
    .nullable(),
  stock: z
    .string()
    .or(z.number())
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val >= 0, 'Estoque deve ser um número inteiro válido maior ou igual a zero')
    .optional(),
  image: z
    .string()
    .url('Imagem deve ser uma URL válida')
    .optional()
    .nullable(),
  active: z
    .boolean()
    .optional()
});

