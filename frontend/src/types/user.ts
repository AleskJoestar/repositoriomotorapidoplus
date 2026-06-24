import { AccessType } from '@/types/auth';

export interface SystemUser {
  id: number;
  email: string;
  accessType: AccessType;
  isMasterSeed: boolean;
  employeeId?: number | null;
  employeeName?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  inactivatedAt?: string | null;
}

export interface CreateSystemUserRequest {
  email: string;
  senha: string;
  employeeId?: number;
  accessType: AccessType;
}

export interface UpdateSystemUserRequest {
  senha?: string;
  accessType?: AccessType;
}
