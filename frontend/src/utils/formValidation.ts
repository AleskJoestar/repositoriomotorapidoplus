import { FieldErrors, FieldValues } from 'react-hook-form';

export const EMPLOYEE_FIELD_LABELS: Record<string, string> = {
  name: 'Nome Completo',
  cpf: 'CPF',
  rg: 'RG',
  email: 'E-mail',
  phone: 'Telefone',
  departmentId: 'Departamento',
  positionId: 'Cargo',
  birthDate: 'Data de Nascimento',
  hireDate: 'Data de Admissão',
  salary: 'Salário',
  address: 'Endereço Completo',
  status: 'Status',
};

export const getFirstValidationMessage = <T extends FieldValues>(
  errors: FieldErrors<T>,
  labels: Record<string, string> = EMPLOYEE_FIELD_LABELS
): string | null => {
  const orderedFields = Object.keys(labels);
  const field =
    orderedFields.find((key) => errors[key as keyof typeof errors]) ||
    Object.keys(errors)[0];
  if (!field) return null;

  const label = labels[field] || field;
  const message = errors[field as keyof typeof errors]?.message;
  if (typeof message === 'string' && message.trim()) {
    return `${label}: ${message}`;
  }
  return `${label}: campo inválido ou vazio`;
};

export const PART_FIELD_LABELS: Record<string, string> = {
  name: 'Nome do Produto',
  categoryId: 'Categoria',
  manufacturerId: 'Fabricante',
  quantity: 'Quantidade',
  minQuantity: 'Quantidade Mínima',
  price: 'Preço',
  description: 'Descrição',
  serialNumber: 'Número de Série',
  location: 'Localização',
};

export const createOnInvalidHandler =
  (onError: (message: string) => void, labels: Record<string, string>) =>
  (errors: FieldErrors<FieldValues>) => {
    const message = getFirstValidationMessage(errors, labels);
    if (message) onError(message);
  };
