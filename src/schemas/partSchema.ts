import { z } from 'zod';

export const createPartSchema = z.object({
  name: z.string().min(1, 'Nome da peça é obrigatório'),
  categoryId: z
    .number({ invalid_type_error: 'Categoria é obrigatória' })
    .int('Categoria inválida')
    .positive('Categoria inválida'),
  manufacturerId: z
    .number({ invalid_type_error: 'Fabricante é obrigatório' })
    .int('Fabricante inválido')
    .positive('Fabricante inválido'),
  quantity: z
    .number({ invalid_type_error: 'Quantidade deve ser um número' })
    .int('Quantidade deve ser um número inteiro')
    .min(0, 'Quantidade não pode ser negativa'),
  description: z.string().optional(),
  serialNumber: z.string().optional(),
  location: z.string().optional(),
  minQuantity: z
    .number({ invalid_type_error: 'Quantidade mínima é obrigatória' })
    .int('Quantidade mínima deve ser um número inteiro')
    .min(1, 'Quantidade mínima deve ser no mínimo 1'),
  price: z
    .number({ invalid_type_error: 'Preço é obrigatório' })
    .min(0, 'Preço não pode ser negativo'),
});

export const updatePartSchema = createPartSchema.partial();

export type CreatePartInput = z.infer<typeof createPartSchema>;
export type UpdatePartInput = z.infer<typeof updatePartSchema>;
