import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Department,
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  departmentService,
} from '@/services/departmentService';

export interface UseDepartmentsReturn {
  departments: Department[];
  loading: boolean;
  error: string | null;
  fetchDepartments: (includeInactive?: boolean) => Promise<void>;
  fetchDepartmentById: (id: string) => Promise<Department | null>;
  createDepartment: (data: CreateDepartmentRequest) => Promise<void>;
  updateDepartment: (id: string, data: UpdateDepartmentRequest) => Promise<void>;
  inactivateDepartment: (id: string) => Promise<void>;
  reactivateDepartment: (id: string) => Promise<void>;
}

export function useDepartments(): UseDepartmentsReturn {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchDepartments = useCallback(
    async (includeInactive = false) => {
      setLoading(true);
      setError(null);
      try {
        const data = await departmentService.getAll(includeInactive);
        setDepartments(data);
      } catch (err: any) {
        const message = err.response?.data?.error || 'Erro ao carregar departamentos';
        setError(message);
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const fetchDepartmentById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await departmentService.getById(id);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao carregar departamento');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createDepartment = useCallback(async (data: CreateDepartmentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const created = await departmentService.create(data);
      setDepartments((prev) => [...prev, created]);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao criar departamento';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateDepartment = useCallback(async (id: string, data: UpdateDepartmentRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await departmentService.update(id, data);
      setDepartments((prev) => prev.map((d) => (d.id === Number(id) ? updated : d)));
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao atualizar departamento';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const inactivateDepartment = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await departmentService.inactivate(id);
      setDepartments((prev) => prev.map((d) => (d.id === Number(id) ? updated : d)));
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao inativar departamento';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateDepartment = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await departmentService.reactivate(id);
      setDepartments((prev) => prev.map((d) => (d.id === Number(id) ? updated : d)));
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao reativar departamento';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    departments,
    loading,
    error,
    fetchDepartments,
    fetchDepartmentById,
    createDepartment,
    updateDepartment,
    inactivateDepartment,
    reactivateDepartment,
  };
}
