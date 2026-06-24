export interface AuthPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
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
    accessType: string;
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
  departmentId: number;
  departmentName: string;
  positionId: number;
  positionName: string;
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
  departmentId: number;
  positionId: number;
  birthDate: string | Date;
  hireDate: string | Date;
  salary: number;
  address: string;
  status?: "Ativo" | "Inativo";
}

export interface UpdateEmployeeRequest {
  name?: string;
  cpf?: string;
  rg?: string;
  email?: string;
  phone?: string;
  departmentId?: number;
  positionId?: number;
  birthDate?: string | Date;
  hireDate?: string | Date;
  salary?: number;
  address?: string;
  status?: "Ativo" | "Inativo";
}

export interface AuditLog {
  id: string;
  employeeId: number;
  action: "CREATE" | "UPDATE" | "DELETE";
  changedFields: Record<string, any>;
  userId: string;
  createdAt: Date;
}

export interface EmployeeFilters {
  position?: string;
  department?: string;
  status?: string;
  hireDateFrom?: string;
  hireDateTo?: string;
}

// ============ PART TYPES ============

export interface Part {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  categoryName: string;
  manufacturerId: number;
  manufacturerName: string;
  quantity: number;
  description?: string | null;
  serialNumber?: string | null;
  location?: string | null;
  minQuantity: number;
  price: number;
  status: "Ativo" | "Inativo";
  createdAt: Date;
  updatedAt: Date;
  inactivatedAt?: Date | null;
}

export interface CreatePartRequest {
  name: string;
  categoryId: number;
  manufacturerId: number;
  quantity: number;
  description?: string;
  serialNumber?: string;
  location?: string;
  minQuantity: number;
  price: number;
}

export interface UpdatePartRequest {
  name?: string;
  categoryId?: number;
  manufacturerId?: number;
  quantity?: number;
  description?: string;
  serialNumber?: string;
  location?: string;
  minQuantity?: number;
  price?: number;
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
  userName?: string;
  createdAt: Date;
}
