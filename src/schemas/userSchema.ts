import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  employeeId: z.number().int().positive().optional(),
  accessType: z.enum(['MASTER', 'COMUM']),
});
