export interface Employee {
  id: number;
  name: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  departmentId: number;
  positionId: number;
  departmentName?: string;
  positionName?: string;
  department?: { id: number; name: string };
  position?: { id: number; name: string };
  birthDate: string;
  hireDate: string;
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
  departmentId: number;
  positionId: number;
  birthDate: string;
  hireDate: string;
  salary: number;
  address: string;
  status?: 'Ativo' | 'Inativo';
}

export interface UpdateEmployeeRequest extends Partial<CreateEmployeeRequest> {}

export interface EmployeeFilters {
  position?: string;
  department?: string;
  status?: 'Ativo' | 'Inativo' | 'todos';
  hireDateFrom?: string;
  hireDateTo?: string;
}

export interface Position {
  id: number;
  name: string;
  status: string;
}

export interface DepartmentOption {
  id: number;
  name: string;
  status: string;
  positions?: Position[];
}
