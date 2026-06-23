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
  id: number;
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
  employeeId: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  changedFields: Record<string, any>;
  userId: string;
  createdAt: Date;
}

// ============ PART TYPES ============

export interface Part {
  id: number;
  code: string;
  name: string;
  category: string;
  quantity: number;
  description?: string | null;
  manufacturer?: string | null;
  serialNumber?: string | null;
  location?: string | null;
  minQuantity?: number | null;
  status: "Ativo" | "Inativo";
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt?: Date | null;
}

export interface CreatePartRequest {
  name: string;
  category: string;
  quantity: number;
  description?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  minQuantity?: number;
}

export interface UpdatePartRequest {
  name?: string;
  category?: string;
  quantity?: number;
  description?: string;
  manufacturer?: string;
  serialNumber?: string;
  location?: string;
  minQuantity?: number;
}

export interface PartFilters {
  category?: string;
  manufacturer?: string;
  status?: string;
  lowStock?: string;
}

export interface PartAuditLog {
  id: string;
  partId: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  changedFields: Record<string, unknown>;
  userId: string;
  createdAt: Date;
}
