import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Category,
  CreateCategoryRequest,
  UpdateCategoryRequest,
} from '@/types/category';
import { categoryService } from '@/services/categoryService';

export interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  fetchCategories: (includeInactive?: boolean) => Promise<void>;
  createCategory: (data: CreateCategoryRequest) => Promise<void>;
  updateCategory: (id: string, data: UpdateCategoryRequest) => Promise<void>;
  inactivateCategory: (id: string) => Promise<void>;
  reactivateCategory: (id: string) => Promise<void>;
  downloadReportPdf: () => Promise<void>;
  downloadReportXml: () => Promise<void>;
}

const downloadFile = (blob: Blob, filename: string) => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchCategories = useCallback(
    async (includeInactive = false) => {
      setLoading(true);
      setError(null);
      try {
        const data = await categoryService.getAll(includeInactive);
        setCategories(data);
      } catch (err: any) {
        const message = err.response?.data?.error || 'Erro ao carregar categorias';
        setError(message);
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const createCategory = useCallback(async (data: CreateCategoryRequest) => {
    setLoading(true);
    setError(null);
    try {
      const created = await categoryService.create(data);
      setCategories((prev) => [...prev, created]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCategory = useCallback(async (id: string, data: UpdateCategoryRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await categoryService.update(id, data);
      setCategories((prev) => prev.map((c) => (c.id === Number(id) ? updated : c)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const inactivateCategory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await categoryService.inactivate(id);
      setCategories((prev) => prev.map((c) => (c.id === Number(id) ? updated : c)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao inativar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateCategory = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await categoryService.reactivate(id);
      setCategories((prev) => prev.map((c) => (c.id === Number(id) ? updated : c)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao reativar categoria');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReportPdf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await categoryService.downloadReportPdf();
      downloadFile(blob, `categorias-${Date.now()}.pdf`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao exportar PDF');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReportXml = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await categoryService.downloadReportXml();
      downloadFile(blob, `categorias-${Date.now()}.xml`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao exportar XML');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    categories,
    loading,
    error,
    fetchCategories,
    createCategory,
    updateCategory,
    inactivateCategory,
    reactivateCategory,
    downloadReportPdf,
    downloadReportXml,
  };
}
