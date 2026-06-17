import { z } from 'zod';

/**
 * Validar CPF: formato XXX.XXX.XXX-XX e dígitos verificadores
 */
const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleaned = cpf.replace(/\D/g, '');

  // Validar formato: deve ter 11 dígitos
  if (cleaned.length !== 11) return false;

  // Validar se todos os dígitos são iguais (inválido)
  if (/^(\d)\1{10}$/.test(cleaned)) return false;

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * (10 - i);
  }
  let remainder = sum % 11;
  const firstDigit = remainder < 2 ? 0 : 11 - remainder;

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned[i]) * (11 - i);
  }
  remainder = sum % 11;
  const secondDigit = remainder < 2 ? 0 : 11 - remainder;

  // Validar dígitos verificadores
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
 * Schema para criação de funcionário
 */
export const createEmployeeSchema = z
  .object({
    name: z
      .string()
      .min(1, 'Nome é obrigatório'),
    cpf: z
      .string()
      .min(1, 'CPF é obrigatório'),
    rg: z
      .string()
      .min(1, 'RG é obrigatório'),
    email: z
      .string()
      .min(1, 'E-mail é obrigatório'),
    phone: z
      .string()
      .min(1, 'Telefone é obrigatório'),
    cargo: z
      .string()
      .min(1, 'Cargo é obrigatório'),
    department: z
      .string()
      .min(1, 'Departamento é obrigatório'),
    birthDate: z
      .union([z.string(), z.date()])
      .transform((val) => new Date(val)),
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
  })
  .strict();

/**
 * Schema para atualização de funcionário (todos os campos opcionais)
 */
export const updateEmployeeSchema = createEmployeeSchema
  .partial()
  .strict();

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
 * Types inferidos automaticamente do Zod
 */
export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
