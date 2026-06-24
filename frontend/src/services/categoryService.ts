import api from './api';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/category';

export const categoryService = {
  getAll: async (includeInactive = false): Promise<Category[]> => {
    const response = await api.get('/categories', {
      params: includeInactive ? { includeInactive: 'true' } : undefined,
    });
    return response.data;
  },

  create: async (data: CreateCategoryRequest): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryRequest): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  inactivate: async (id: string): Promise<Category> => {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  },

  reactivate: async (id: string): Promise<Category> => {
    const response = await api.patch(`/categories/${id}/reactivate`);
    return response.data;
  },

  downloadReportPdf: async (): Promise<Blob> => {
    const response = await api.get('/categories/report/pdf', {
      responseType: 'blob',
    });
    return response.data;
  },

  downloadReportXml: async (): Promise<Blob> => {
    const response = await api.get('/categories/report/xml', {
      responseType: 'blob',
    });
    return response.data;
  },
};
