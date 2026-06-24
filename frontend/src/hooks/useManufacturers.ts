import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Manufacturer,
  CreateManufacturerRequest,
  UpdateManufacturerRequest,
} from '@/types/manufacturer';
import { manufacturerService } from '@/services/manufacturerService';

export interface UseManufacturersReturn {
  manufacturers: Manufacturer[];
  loading: boolean;
  error: string | null;
  fetchManufacturers: (includeInactive?: boolean) => Promise<void>;
  createManufacturer: (data: CreateManufacturerRequest) => Promise<void>;
  updateManufacturer: (id: string, data: UpdateManufacturerRequest) => Promise<void>;
  inactivateManufacturer: (id: string) => Promise<void>;
  reactivateManufacturer: (id: string) => Promise<void>;
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

export function useManufacturers(): UseManufacturersReturn {
  const [manufacturers, setManufacturers] = useState<Manufacturer[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchManufacturers = useCallback(
    async (includeInactive = false) => {
      setLoading(true);
      setError(null);
      try {
        const data = await manufacturerService.getAll(includeInactive);
        setManufacturers(data);
      } catch (err: any) {
        const message = err.response?.data?.error || 'Erro ao carregar fabricantes';
        setError(message);
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const createManufacturer = useCallback(async (data: CreateManufacturerRequest) => {
    setLoading(true);
    setError(null);
    try {
      const created = await manufacturerService.create(data);
      setManufacturers((prev) => [...prev, created]);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao criar fabricante');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateManufacturer = useCallback(async (id: string, data: UpdateManufacturerRequest) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await manufacturerService.update(id, data);
      setManufacturers((prev) => prev.map((m) => (m.id === Number(id) ? updated : m)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao atualizar fabricante');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const inactivateManufacturer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await manufacturerService.inactivate(id);
      setManufacturers((prev) => prev.map((m) => (m.id === Number(id) ? updated : m)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao inativar fabricante');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reactivateManufacturer = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await manufacturerService.reactivate(id);
      setManufacturers((prev) => prev.map((m) => (m.id === Number(id) ? updated : m)));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao reativar fabricante');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReportPdf = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const blob = await manufacturerService.downloadReportPdf();
      downloadFile(blob, `fabricantes-${Date.now()}.pdf`);
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
      const blob = await manufacturerService.downloadReportXml();
      downloadFile(blob, `fabricantes-${Date.now()}.xml`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao exportar XML');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    manufacturers,
    loading,
    error,
    fetchManufacturers,
    createManufacturer,
    updateManufacturer,
    inactivateManufacturer,
    reactivateManufacturer,
    downloadReportPdf,
    downloadReportXml,
  };
}
