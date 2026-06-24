export const LOW_STOCK_THRESHOLD = 5;

export const formatPartPrice = (price?: number | null): string =>
  (price ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export interface Part {
  id: number;
  code: string;
  name: string;
  categoryId: number;
  manufacturerId: number;
  categoryName?: string;
  manufacturerName?: string;
  category?: { id: number; name: string };
  manufacturer?: { id: number; name: string };
  quantity: number;
  description?: string | null;
  serialNumber?: string | null;
  location?: string | null;
  minQuantity: number;
  price: number;
  status: 'Ativo' | 'Inativo';
  createdAt: string;
  updatedAt: string;
  inactivatedAt?: string | null;
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

export interface UpdatePartRequest extends Partial<CreatePartRequest> {}

export interface PartFilters {
  category?: string;
  manufacturer?: string;
  status?: string;
  lowStock?: string;
}

export interface DeletePartResponse {
  part: Part;
  message: string;
}

export interface PartAuditLogEntry {
  id: string;
  partId: number;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  changedFields: Record<string, unknown>;
  userId: string;
  userName: string;
  createdAt: string;
}

export interface CategoryOption {
  id: number;
  name: string;
  status: string;
}

export interface ManufacturerOption {
  id: number;
  name: string;
  status: string;
}
