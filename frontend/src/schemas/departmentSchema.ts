import { z } from 'zod';

export const departmentFormSchema = z.object({
  name: z.string().min(1, 'Nome do departamento é obrigatório'),
});

export const createDepartmentSchema = departmentFormSchema.extend({
  positions: z
    .array(z.string().min(1, 'Nome do cargo é obrigatório'))
    .min(1, 'Informe ao menos um cargo'),
});

export const updateDepartmentSchema = z.object({
  name: z.string().min(1, 'Nome do departamento é obrigatório').optional(),
  positions: z
    .array(z.string().min(1, 'Nome do cargo é obrigatório'))
    .min(1, 'Informe ao menos um cargo')
    .optional(),
});

export type DepartmentFormData = z.infer<typeof departmentFormSchema>;
