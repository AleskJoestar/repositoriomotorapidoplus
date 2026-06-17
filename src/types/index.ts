export interface AuthPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
}

// ============ EMPLOYEE TYPES ============

export interface Employee {
  id: string;
  name: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  cargo: string;
  department: string;
  birthDate: Date;
  hireDate: Date;
  salary: number;
  address: string;
  status: "Ativo" | "Inativo";
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt?: Date | null;
}

export interface CreateEmployeeRequest {
  name: string;
  cpf: string;
  rg: string;
  email: string;
  phone: string;
  cargo: string;
  department: string;
  birthDate: string | Date;
  hireDate: string | Date;
  salary: number;
  address: string;
}

export interface UpdateEmployeeRequest {
  name?: string;
  cpf?: string;
  rg?: string;
  email?: string;
  phone?: string;
  cargo?: string;
  department?: string;
  birthDate?: string | Date;
  hireDate?: string | Date;
  salary?: number;
  address?: string;
}

export interface AuditLog {
  id: string;
  employeeId: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  changedFields: Record<string, any>;
  userId: string;
  createdAt: Date;
}
