import { z } from 'zod';

export const createPartSchema = z.object({
  name: z.string().min(1, 'Nome da peça é obrigatório'),
  category: z.string().min(1, 'Categoria é obrigatória'),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantidade deve ser um número' })
    .int('Quantidade deve ser um número inteiro')
    .min(0, 'Quantidade não pode ser negativa'),
  description: z.string().optional(),
  manufacturer: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  minQuantity: z.coerce
    .number()
    .int('Quantidade mínima deve ser um número inteiro')
    .min(0, 'Quantidade mínima não pode ser negativa')
    .optional()
    .or(z.literal('')),
});

export const updatePartSchema = createPartSchema.partial();

export type CreatePartFormData = z.infer<typeof createPartSchema>;
export type UpdatePartFormData = z.infer<typeof updatePartSchema>;
