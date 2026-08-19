import { z } from 'zod';

/**
 * Promotion validation schemas
 */

export const createPromotionSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .max(100, 'Nome muito longo'),
  description: z
    .string()
    .max(500, 'Descrição muito longa')
    .optional()
    .nullable(),
  discountType: z
    .enum(['PERCENTAGE', 'FIXED'], {
      errorMap: () => ({ message: 'Tipo de desconto inválido' })
    }),
  discountValue: z
    .string()
    .or(z.number())
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Valor do desconto deve ser um número válido maior ou igual a zero')
    .refine((val, ctx) => {
      // Additional validation will be done in the service layer based on discountType
      return true;
    }, 'Valor do desconto inválido'),
  startDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), 'Data de início inválida'),
  endDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), 'Data de término inválida'),
  active: z
    .boolean()
    .optional()
    .default(true)
}).refine((data) => data.endDate > data.startDate, {
  message: 'Data de término deve ser maior que data de início',
  path: ['endDate']
});

export const updatePromotionSchema = z.object({
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
  discountType: z
    .enum(['PERCENTAGE', 'FIXED'], {
      errorMap: () => ({ message: 'Tipo de desconto inválido' })
    })
    .optional(),
  discountValue: z
    .string()
    .or(z.number())
    .transform((val) => parseFloat(val))
    .refine((val) => !isNaN(val) && val >= 0, 'Valor do desconto deve ser um número válido maior ou igual a zero')
    .optional(),
  startDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), 'Data de início inválida')
    .optional(),
  endDate: z
    .string()
    .or(z.date())
    .transform((val) => new Date(val))
    .refine((val) => !isNaN(val.getTime()), 'Data de término inválida')
    .optional(),
  active: z
    .boolean()
    .optional()
});
