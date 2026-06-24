import { z } from 'zod';

export const createDepartmentSchema = z.object({
  name: z.string().min(1, 'Nome do departamento é obrigatório'),
  positions: z
    .array(z.string().min(1))
    .min(1, 'Informe ao menos um cargo'),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1).optional(),
  positions: z
    .array(z.string().min(1))
    .min(1, 'Informe ao menos um cargo')
    .optional(),
});
