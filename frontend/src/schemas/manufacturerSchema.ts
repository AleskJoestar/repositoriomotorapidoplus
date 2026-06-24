import { z } from 'zod';

export const createManufacturerSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  cnpj: z.string().optional(),
  address: z.string().optional(),
  contact: z.string().optional(),
});

export const updateManufacturerSchema = createManufacturerSchema.partial();

export type CreateManufacturerFormData = z.infer<typeof createManufacturerSchema>;
export type UpdateManufacturerFormData = z.infer<typeof updateManufacturerSchema>;
