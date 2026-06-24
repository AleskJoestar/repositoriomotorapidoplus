import api from './api';
import {
  Part,
  CreatePartRequest,
  UpdatePartRequest,
  PartFilters,
  DeletePartResponse,
  PartAuditLogEntry,
} from '@/types/part';

export const partService = {
  createPart: async (data: CreatePartRequest): Promise<Part> => {
    const response = await api.post('/parts', data);
    return response.data;
  },

  getAllParts: async (filters?: PartFilters): Promise<Part[]> => {
    const response = await api.get('/parts', { params: filters });
    return response.data;
  },

  getPartById: async (id: string): Promise<Part> => {
    const response = await api.get(`/parts/${id}`);
    return response.data;
  },

  updatePart: async (id: string, data: UpdatePartRequest): Promise<Part> => {
    const response = await api.put(`/parts/${id}`, data);
    return response.data;
  },

  deletePart: async (id: string): Promise<DeletePartResponse> => {
    const response = await api.delete(`/parts/${id}`);
    return response.data;
  },

  reactivatePart: async (id: string): Promise<Part> => {
    const response = await api.patch(`/parts/${id}/reactivate`);
    return response.data;
  },

  downloadReportPdf: async (filters?: PartFilters): Promise<Blob> => {
    const response = await api.get('/parts/report/pdf', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  downloadReportXlsx: async (filters?: PartFilters): Promise<Blob> => {
    const response = await api.get('/parts/report/xlsx', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  getAuditLogs: async (id: string): Promise<PartAuditLogEntry[]> => {
    const response = await api.get(`/parts/${id}/audit-logs`);
    return response.data;
  },
};
