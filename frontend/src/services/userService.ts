import api from './api';
import { SystemUser, CreateSystemUserRequest } from '@/types/user';

export const userService = {
  getAll: async (): Promise<SystemUser[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  create: async (data: CreateSystemUserRequest): Promise<SystemUser> => {
    const payload = {
      ...data,
      employeeId: data.employeeId || undefined,
    };
    const response = await api.post('/users', payload);
    return response.data;
  },

  inactivate: async (id: string): Promise<SystemUser> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },

  reactivate: async (id: string): Promise<SystemUser> => {
    const response = await api.patch(`/users/${id}/reactivate`);
    return response.data;
  },

  downloadReportPdf: async (): Promise<Blob> => {
    const response = await api.get('/users/report/pdf', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadReportXml: async (): Promise<Blob> => {
    const response = await api.get('/users/report/xml', {
      responseType: 'blob',
    });
    return response.data;
  },
};
