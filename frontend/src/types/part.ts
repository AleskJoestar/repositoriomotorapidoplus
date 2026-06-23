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
  status: 'Ativo' | 'Inativo';
  createdAt: string;
  updatedAt: string;
  inactivatedAt?: string | null;
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
