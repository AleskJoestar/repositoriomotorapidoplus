import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
  employeeId: z.number().int().positive().optional(),
  accessType: z.enum(['MASTER', 'COMUM']),
});

export const updateUserSchema = z
  .object({
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').optional(),
    accessType: z.enum(['MASTER', 'COMUM']).optional(),
  })
  .refine((data) => data.senha !== undefined || data.accessType !== undefined, {
    message: 'Informe senha ou tipo de acesso para atualizar',
  });
