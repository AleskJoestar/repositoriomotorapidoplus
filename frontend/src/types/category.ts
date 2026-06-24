export interface Category {
  id: number;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  inactivatedAt?: string | null;
}

export interface CreateCategoryRequest {
  name: string;
}

export interface UpdateCategoryRequest {
  name: string;
}
