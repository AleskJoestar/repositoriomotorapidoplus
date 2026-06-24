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
