export interface Manufacturer {
  id: number;
  name: string;
  cnpj?: string | null;
  address?: string | null;
  contact?: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  inactivatedAt?: string | null;
}

export interface CreateManufacturerRequest {
  name: string;
  cnpj?: string;
  address?: string;
  contact?: string;
}

export interface UpdateManufacturerRequest extends Partial<CreateManufacturerRequest> {}
