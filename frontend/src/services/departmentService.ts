import api from './api';
import { DepartmentOption, Position } from '@/types/employee';

export interface Department {
  id: number;
  name: string;
  status: string;
  positions: Position[];
  createdAt: string;
  updatedAt: string;
  inactivatedAt?: string | null;
}

export interface CreateDepartmentRequest {
  name: string;
  positions: string[];
}

export interface UpdateDepartmentRequest {
  name?: string;
  positions?: string[];
}

export const departmentService = {
  getAll: async (includeInactive = false): Promise<Department[]> => {
    const response = await api.get('/departments', {
      params: includeInactive ? { includeInactive: 'true' } : undefined,
    });
    return response.data;
  },

  getById: async (id: string): Promise<Department> => {
    const response = await api.get(`/departments/${id}`);
    return response.data;
  },

  getPositions: async (departmentId: number): Promise<Position[]> => {
    const response = await api.get(`/departments/${departmentId}/positions`);
    return response.data;
  },

  create: async (data: CreateDepartmentRequest): Promise<Department> => {
    const response = await api.post('/departments', data);
    return response.data;
  },

  update: async (id: string, data: UpdateDepartmentRequest): Promise<Department> => {
    const response = await api.put(`/departments/${id}`, data);
    return response.data;
  },

  inactivate: async (id: string): Promise<Department> => {
    const response = await api.delete(`/departments/${id}`);
    return response.data;
  },

  reactivate: async (id: string): Promise<Department> => {
    const response = await api.patch(`/departments/${id}/reactivate`);
    return response.data;
  },

  getActiveOptions: async (): Promise<DepartmentOption[]> => {
    const departments = await departmentService.getAll(false);
    return departments.map(({ id, name, status, positions }) => ({
      id,
      name,
      status,
      positions,
    }));
  },
};
