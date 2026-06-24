import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SaleFilters, SaleReportRow } from '@/types/sale';
import { saleService } from '@/services/saleService';

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

export function useSalesReport() {
  const [sales, setSales] = useState<SaleReportRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const fetchSales = useCallback(
    async (filters?: SaleFilters) => {
      setLoading(true);
      setError(null);
      try {
        const data = await saleService.getReport(filters);
        setSales(data);
      } catch (err: any) {
        const message = err.response?.data?.error || 'Erro ao carregar vendas';
        setError(message);
        if (err.response?.status === 401) navigate('/login');
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  const downloadReportPdf = useCallback(async (filters?: SaleFilters) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await saleService.downloadReportPdf(filters);
      downloadFile(blob, `relatorio-vendas-${Date.now()}.pdf`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao exportar PDF');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const downloadReportXml = useCallback(async (filters?: SaleFilters) => {
    setLoading(true);
    setError(null);
    try {
      const blob = await saleService.downloadReportXml(filters);
      downloadFile(blob, `relatorio-vendas-${Date.now()}.xml`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erro ao exportar XML');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sales,
    loading,
    error,
    fetchSales,
    downloadReportPdf,
    downloadReportXml,
  };
}
