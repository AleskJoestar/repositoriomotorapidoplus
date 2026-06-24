import api from './api';
import {
  Manufacturer,
  CreateManufacturerRequest,
  UpdateManufacturerRequest,
} from '@/types/manufacturer';

export const manufacturerService = {
  getAll: async (includeInactive = false): Promise<Manufacturer[]> => {
    const response = await api.get('/manufacturers', {
      params: includeInactive ? { includeInactive: 'true' } : undefined,
    });
    return response.data;
  },

  create: async (data: CreateManufacturerRequest): Promise<Manufacturer> => {
    const response = await api.post('/manufacturers', data);
    return response.data;
  },

  update: async (id: string, data: UpdateManufacturerRequest): Promise<Manufacturer> => {
    const response = await api.put(`/manufacturers/${id}`, data);
    return response.data;
  },

  inactivate: async (id: string): Promise<Manufacturer> => {
    const response = await api.delete(`/manufacturers/${id}`);
    return response.data;
  },

  reactivate: async (id: string): Promise<Manufacturer> => {
    const response = await api.patch(`/manufacturers/${id}/reactivate`);
    return response.data;
  },

  downloadReportPdf: async (): Promise<Blob> => {
    const response = await api.get('/manufacturers/report/pdf', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadReportXml: async (): Promise<Blob> => {
    const response = await api.get('/manufacturers/report/xml', {
      responseType: 'blob',
    });
    return response.data;
  },
};
