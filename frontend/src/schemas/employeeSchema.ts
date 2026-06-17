import { z } from 'zod';

// Validador de CPF
export const validateCPF = (cpf: string): boolean => {
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verificar se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verificar se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validar primeiro dígito verificador
  let sum = 0;
  let remainder;
  
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (11 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(9, 10))) return false;
  
  // Validar segundo dígito verificador
  sum = 0;
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cleanCPF.substring(i - 1, i)) * (12 - i);
  }
  
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleanCPF.substring(10, 11))) return false;
  
  return true;
};

// Mascara CPF
export const maskCPF = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 11);
  return cleanValue
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{2})$/, '$1-$2');
};

// Mascara Telefone
export const maskPhone = (value: string): string => {
  const cleanValue = value.replace(/\D/g, '').slice(0, 11);
  if (cleanValue.length <= 2) return cleanValue;
  if (cleanValue.length <= 7) {
    return cleanValue.replace(/(\d{2})(\d)/, '($1) $2');
  }
  return cleanValue.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
};

// Calcular idade
const calculateAge = (birthDate: string): number => {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  return age;
};

// Schema para criar funcionário
export const createEmployeeSchema = z.object({
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
    .string()
    .min(1, 'Data de nascimento é obrigatória'),
  hireDate: z
    .string()
    .min(1, 'Data de admissão é obrigatória'),
  salary: z
    .union([z.number(), z.string()])
    .transform((val) => typeof val === 'string' ? parseFloat(val) : val),
  address: z
    .string()
    .min(1, 'Endereço é obrigatório'),
});

// Schema para atualizar funcionário (todos opcionais)
export const updateEmployeeSchema = createEmployeeSchema.partial();

// Type do formulário
export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
