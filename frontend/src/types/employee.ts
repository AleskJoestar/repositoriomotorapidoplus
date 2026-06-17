export interface Employee {
  id: number;
  name: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  cargo: string;
  department: string;
  birthDate: string; // ISO date YYYY-MM-DD
  hireDate: string; // ISO date YYYY-MM-DD
  salary: number;
  address: string;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
  updatedAt: string;
}

export interface CreateEmployeeRequest {
  name: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  cargo: string;
  department: string;
  birthDate: string; // YYYY-MM-DD
  hireDate: string; // YYYY-MM-DD
  salary: number;
  address: string;
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

export interface EmployeeFilters {
  cargo?: string;
  department?: string;
  status?: 'Ativo' | 'Inativo' | 'todos';
}
