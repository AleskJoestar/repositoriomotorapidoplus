import { z } from 'zod';

export const LOW_STOCK_THRESHOLD = 5;

export const createPartSchema = z.object({
  name: z.string().min(1, 'Nome do produto é obrigatório'),
  categoryId: z.coerce
    .number({ invalid_type_error: 'Categoria é obrigatória' })
    .int()
    .min(1, 'Categoria é obrigatória'),
  manufacturerId: z.coerce
    .number({ invalid_type_error: 'Fabricante é obrigatório' })
    .int()
    .min(1, 'Fabricante é obrigatório'),
  quantity: z.coerce
    .number({ invalid_type_error: 'Quantidade deve ser um número' })
    .int('Quantidade deve ser um número inteiro')
    .min(0, 'Quantidade não pode ser negativa'),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  minQuantity: z.coerce
    .number({ invalid_type_error: 'Quantidade mínima é obrigatória' })
    .int('Quantidade mínima deve ser um número inteiro')
    .min(1, 'Quantidade mínima deve ser no mínimo 1'),
  price: z.coerce
    .number({ invalid_type_error: 'Preço é obrigatório' })
    .min(0, 'Preço não pode ser negativo'),
});

export const updatePartSchema = createPartSchema.partial();

export type CreatePartFormData = z.infer<typeof createPartSchema>;
export type UpdatePartFormData = z.infer<typeof updatePartSchema>;
