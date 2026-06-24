import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SystemUser, CreateSystemUserRequest, UpdateSystemUserRequest } from '@/types/user';
import { userService } from '@/services/userService';

export interface UseUsersReturn {
  users: SystemUser[];
  loading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  createUser: (data: CreateSystemUserRequest) => Promise<void>;
  updateUser: (id: string, data: UpdateSystemUserRequest) => Promise<void>;
  inactivateUser: (id: string) => Promise<void>;
  reactivateUser: (id: string) => Promise<void>;
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

export function useUsers(): UseUsersReturn {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getAll();
      setUsers(data);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao carregar usuários';
      setError(message);
      if (err.response?.status === 401 || err.response?.status === 403) {
        navigate('/dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  const createUser = useCallback(async (data: CreateSystemUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      const created = await userService.create(data);
      setUsers((prev) => [created, ...prev]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = useCallback(async (id: string, data: UpdateSystemUserRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userService.update(id, data);
      setUsers((prev) => prev.map((u) => (u.id === Number(id) ? updated : u)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const inactivateUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userService.inactivate(id);
      setUsers((prev) => prev.map((u) => (u.id === Number(id) ? updated : u)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao inativar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateUser = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await userService.reactivate(id);
      setUsers((prev) => prev.map((u) => (u.id === Number(id) ? updated : u)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao reativar usuário');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReportPdf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await userService.downloadReportPdf();
      downloadFile(blob, `usuarios-${Date.now()}.pdf`);
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
      const blob = await userService.downloadReportXml();
      downloadFile(blob, `usuarios-${Date.now()}.xml`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao exportar XML');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    inactivateUser,
    reactivateUser,
    downloadReportPdf,
    downloadReportXml,
  };
}
