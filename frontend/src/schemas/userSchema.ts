import { z } from 'zod';

export const createSystemUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  employeeId: z.coerce.number().int().positive().optional().or(z.literal('')),
  accessType: z.enum(['MASTER', 'COMUM'], {
    required_error: 'Tipo de acesso é obrigatório',
  }),
});

export type CreateSystemUserFormData = z.infer<typeof createSystemUserSchema>;

export const updateSystemUserSchema = z
  .object({
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional().or(z.literal('')),
    accessType: z.enum(['MASTER', 'COMUM'], {
      required_error: 'Tipo de acesso é obrigatório',
    }),
  })
  .transform((data) => ({
    accessType: data.accessType,
    senha: data.senha && data.senha.length > 0 ? data.senha : undefined,
  }));

export type UpdateSystemUserFormData = z.input<typeof updateSystemUserSchema>;
