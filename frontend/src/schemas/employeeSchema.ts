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
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  cpf: z
    .string()
    .min(1, 'CPF é obrigatório')
    .refine(
      (value) => validateCPF(value),
      'CPF inválido'
    ),
  rg: z
    .string()
    .min(1, 'RG é obrigatório')
    .min(5, 'RG inválido'),
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  phone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .refine(
      (value) => /^\(\d{2}\)\s\d{5}-\d{4}$/.test(value),
      'Telefone deve estar no formato (XX) XXXXX-XXXX'
    ),
  cargo: z
    .string()
    .min(1, 'Cargo é obrigatório')
    .max(100, 'Cargo deve ter no máximo 100 caracteres'),
  department: z
    .string()
    .min(1, 'Departamento é obrigatório')
    .max(100, 'Departamento deve ter no máximo 100 caracteres'),
  birthDate: z
    .string()
    .min(1, 'Data de nascimento é obrigatória')
    .refine(
      (date) => !isNaN(new Date(date).getTime()),
      'Data de nascimento inválida'
    )
    .refine(
      (date) => calculateAge(date) >= 18,
      'Deve ter no mínimo 18 anos'
    ),
  hireDate: z
    .string()
    .min(1, 'Data de admissão é obrigatória')
    .refine(
      (date) => !isNaN(new Date(date).getTime()),
      'Data de admissão inválida'
    )
    .refine(
      (date) => new Date(date) <= new Date(),
      'Data de admissão não pode ser no futuro'
    ),
  salary: z
    .number()
    .min(0.01, 'Salário deve ser maior que 0')
    .refine(
      (value) => /^\d+(\.\d{1,2})?$/.test(value.toFixed(2)),
      'Salário deve ter no máximo 2 casas decimais'
    ),
  address: z
    .string()
    .min(1, 'Endereço é obrigatório')
    .min(5, 'Endereço deve ter no mínimo 5 caracteres')
    .max(200, 'Endereço deve ter no máximo 200 caracteres'),
});

// Schema para atualizar funcionário (todos opcionais)
export const updateEmployeeSchema = createEmployeeSchema.partial();

// Type do formulário
export type CreateEmployeeFormData = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormData = z.infer<typeof updateEmployeeSchema>;
