import api from './api';
import { Sale, CheckoutRequest, SaleFilters, SaleReportRow } from '@/types/sale';

const normalizeSale = (data: Sale): Sale => ({
  ...data,
  totalAmount: data.totalAmount ?? 0,
  items: (data.items ?? []).map((item) => ({
    ...item,
    unitPrice: item.unitPrice ?? 0,
    totalPrice: item.totalPrice ?? 0,
  })),
});

export const saleService = {
  getCurrent: async (): Promise<Sale | null> => {
    const response = await api.get('/sales/current');
    const data = response.data;
    if (!data) return null;
    return normalizeSale(data);
  },

  addItem: async (partId: number, quantity: number): Promise<Sale> => {
    const response = await api.post('/sales/items', { partId, quantity });
    return normalizeSale(response.data);
  },

  removeItem: async (
    partId: number,
    masterCredentials?: { masterEmail: string; masterSenha: string }
  ): Promise<Sale> => {
    const response = await api.delete(`/sales/items/${partId}`, {
      data: masterCredentials ?? {},
    });
    return normalizeSale(response.data);
  },

  checkout: async (data: CheckoutRequest): Promise<Sale> => {
    const response = await api.post('/sales/checkout', data);
    return normalizeSale(response.data);
  },

  getReport: async (filters?: SaleFilters): Promise<SaleReportRow[]> => {
    const response = await api.get('/sales/report', { params: filters });
    return response.data;
  },

  downloadReportPdf: async (filters?: SaleFilters): Promise<Blob> => {
    const response = await api.get('/sales/report/pdf', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },

  downloadReportXml: async (filters?: SaleFilters): Promise<Blob> => {
    const response = await api.get('/sales/report/xml', {
      params: filters,
      responseType: 'blob',
    });
    return response.data;
  },
};
