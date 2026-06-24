import { z } from 'zod';

/**
 * Validar CPF: formato XXX.XXX.XXX-XX e dígitos verificadores
 */
const validateCPF = (cpf: string): boolean => {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;

  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  return (
    firstDigit === parseInt(cleaned[9]) &&
    secondDigit === parseInt(cleaned[10])
  );
};

/**
 * Validar idade mínima de 18 anos
 */
const validateMinAge = (birthDate: Date): boolean => {
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1 >= 18;
  }

  return age >= 18;
};

/**
 * Schema para validação isolada de CPF
 */
export const cpfSchema = z
  .string()
  .refine(
    (cpf) => validateCPF(cpf),
    'CPF inválido. Use o formato XXX.XXX.XXX-XX'
  );

/**
 * Schema para criação de funcionário
 */
export const createEmployeeSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nome é obrigatório'),
    cpf: cpfSchema,
    rg: z
      .string()
      .min(1, 'RG é obrigatório'),
    email: z
      .string()
      .min(1, 'E-mail é obrigatório'),
    phone: z
      .string()
      .min(1, 'Telefone é obrigatório'),
    departmentId: z
      .number({ invalid_type_error: 'Departamento é obrigatório' })
      .int('Departamento inválido')
      .positive('Departamento inválido'),
    positionId: z
      .number({ invalid_type_error: 'Cargo é obrigatório' })
      .int('Cargo inválido')
      .positive('Cargo inválido'),
    birthDate: z
      .union([z.string(), z.date()])
      .transform((val) => new Date(val))
      .refine((val) => validateMinAge(val), 'Funcionário deve ter no mínimo 18 anos'),
    hireDate: z
      .union([z.string(), z.date()])
      .transform((val) => new Date(val)),
    salary: z
      .union([z.number(), z.string()])
      .transform((val) => typeof val === 'string' ? parseFloat(val) : val)
      .refine((val) => !isNaN(val), 'Salário deve ser um número válido'),
    address: z
      .string()
      .min(1, 'Endereço é obrigatório'),
    status: z
      .enum(['Ativo', 'Inativo'])
      .optional()
      .default('Ativo'),
  })
  .strict();

/**
 * Schema para atualização de funcionário (todos os campos opcionais)
 */
export const updateEmployeeSchema = createEmployeeSchema
  .omit({ status: true })
  .partial()
  .extend({
    status: z.enum(['Ativo', 'Inativo']).optional(),
  })
  .strict();

/**
 * Types inferidos automaticamente do Zod
 */
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
