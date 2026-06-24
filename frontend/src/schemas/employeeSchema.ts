import { z } from 'zod';

export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');

  if (cleanCPF.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }

  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;

  return true;
};

export const maskCPF = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 11);
  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{2})$/, '$1-$2');
};

export const maskPhone = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 11);
  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 7) {
    return cleanValue.replace(/(\d{2})(\d)/, '($1) $2');
  }
  return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

const validateMinAge = (birthDateStr: string): boolean => {
  const birthDate = new Date(birthDateStr);
  if (Number.isNaN(birthDate.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age -= 1;
  }
  return age >= 18;
};

const baseEmployeeFields = {
  name: z.string().min(1, 'Nome é obrigatório'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine(validateCPF, 'CPF inválido. Use o formato XXX.XXX.XXX-XX'),
  rg: z.string().min(1, 'RG é obrigatório'),
  email: z.string().min(1, 'E-mail é obrigatório').email('E-mail inválido'),
  phone: z.string().min(1, 'Telefone é obrigatório'),
  departmentId: z.coerce
    .number({ invalid_type_error: 'Departamento é obrigatório' })
    .int()
    .min(1, 'Departamento é obrigatório'),
  positionId: z.coerce
    .number({ invalid_type_error: 'Cargo é obrigatório' })
    .int()
    .min(1, 'Cargo é obrigatório'),
  birthDate: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine(validateMinAge, 'Funcionário deve ter no mínimo 18 anos'),
  hireDate: z.string().min(1, 'Data de admissão é obrigatória'),
  salary: z.coerce
    .number({ invalid_type_error: 'Salário é obrigatório' })
    .min(0.01, 'Salário é obrigatório'),
  address: z.string().min(1, 'Endereço é obrigatório'),
};

export const createEmployeeSchema = z.object(baseEmployeeFields);

export const updateEmployeeSchema = createEmployeeSchema.partial();

export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
