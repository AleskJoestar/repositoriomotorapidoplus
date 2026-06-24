import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Part,
  CreatePartRequest,
  UpdatePartRequest,
  PartFilters,
  DeletePartResponse,
} from '@/types/part';
import { partService } from '@/services/partService';

export interface UsePartsReturn {
  parts: Part[];
  loading: boolean;
  error: string | null;
  createPart: (data: CreatePartRequest) => Promise<void>;
  updatePart: (id: string, data: UpdatePartRequest) => Promise<void>;
  deletePart: (id: string) => Promise<DeletePartResponse>;
  reactivatePart: (id: string) => Promise<void>;
  fetchParts: (filters?: PartFilters) => Promise<void>;
  fetchPartById: (id: string) => Promise<Part | null>;
  downloadReportPdf: (filters?: PartFilters) => Promise<void>;
  downloadReportXlsx: (filters?: PartFilters) => Promise<void>;
}

export function useParts(): UsePartsReturn {
  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchParts = useCallback(
    async (filters?: PartFilters) => {
      setLoading(true);
      setError(null);
      try {
        const data = await partService.getAllParts(filters);
        setParts(data);
      } catch (err: any) {
        const message = err.response?.data?.error || 'Erro ao carregar peças';
        setError(message);
        if (err.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const createPart = useCallback(async (data: CreatePartRequest) => {
    setLoading(true);
    setError(null);
    try {
      const newPart = await partService.createPart(data);
      setParts((prev) => [newPart, ...prev]);
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Erro ao criar peça. Verifique os dados.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePart = useCallback(async (id: string, data: UpdatePartRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await partService.updatePart(id, data);
      setParts((prev) => prev.map((part) => (part.id === Number(id) ? updated : part)));
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Erro ao atualizar peça. Verifique os dados.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePart = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await partService.deletePart(id);
      setParts((prev) =>
        prev.map((part) => (part.id === Number(id) ? result.part : part))
      );
      return result;
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Erro ao inativar peça. Tente novamente.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivatePart = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await partService.reactivatePart(id);
      setParts((prev) => prev.map((part) => (part.id === Number(id) ? updated : part)));
    } catch (err: any) {
      const message =
        err.response?.data?.error || 'Erro ao reativar peça. Tente novamente.';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPartById = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      return await partService.getPartById(id);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao carregar peça';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

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

  const downloadReportPdf = useCallback(async (filters?: PartFilters) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await partService.downloadReportPdf(filters);
      downloadFile(blob, `relatorio-pecas-${Date.now()}.pdf`);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao exportar PDF';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReportXlsx = useCallback(async (filters?: PartFilters) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await partService.downloadReportXlsx(filters);
      downloadFile(blob, `relatorio-pecas-${Date.now()}.xlsx`);
    } catch (err: any) {
      const message = err.response?.data?.error || 'Erro ao exportar XLSX';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    parts,
    loading,
    error,
    createPart,
    updatePart,
    deletePart,
    reactivatePart,
    fetchParts,
    fetchPartById,
    downloadReportPdf,
    downloadReportXlsx,
  };
}
