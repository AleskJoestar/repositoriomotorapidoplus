import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useSalesReport } from '@/hooks/useSalesReport';
import { Toast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { SaleFilters, formatCurrency, formatSaleDateTime } from '@/types/sale';

const DEFAULT_FILTERS: SaleFilters = {};

export const SalesReport: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { sales, loading, error, fetchSales, downloadReportPdf, downloadReportXml } =
    useSalesReport();

  const [filters, setFilters] = useState<SaleFilters>(DEFAULT_FILTERS);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(
    null
  );
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchSales(DEFAULT_FILTERS);
  }, []);

  useEffect(() => {
    if (error) setToast({ message: error, type: 'error' });
  }, [error]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFilterChange = (field: keyof SaleFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [field]: value || undefined }));
  };

  const handleApplyFilters = () => {
    fetchSales(filters);
  };

  const handleClearFilters = () => {
    setFilters(DEFAULT_FILTERS);
    fetchSales(DEFAULT_FILTERS);
  };

  const handleExport = async (format: 'pdf' | 'xml') => {
    setExporting(true);
    try {
      if (format === 'pdf') await downloadReportPdf(filters);
      else await downloadReportXml(filters);
      setToast({ message: 'Relatório exportado com sucesso', type: 'success' });
    } catch {
      setToast({ message: 'Erro ao exportar relatório', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">Relatório de Vendas — MotoRapido PLUS</h1>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => navigate('/sales')}>
              ← Caixa
            </Button>
            {user?.accessType === 'MASTER' && (
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                Início
              </Button>
            )}
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Relatório de Vendas</h2>
            <p className="text-gray-600 mt-1">Vendas finalizadas com filtros por data e horário</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" loading={exporting} onClick={() => handleExport('pdf')}>
              Exportar PDF
            </Button>
            <Button variant="secondary" loading={exporting} onClick={() => handleExport('xml')}>
              Exportar XML
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Início</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.dateFrom ?? ''}
                onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim</label>
              <input
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.dateTo ?? ''}
                onChange={(e) => handleFilterChange('dateTo', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Início</label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.timeFrom ?? ''}
                onChange={(e) => handleFilterChange('timeFrom', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fim</label>
              <input
                type="time"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.timeTo ?? ''}
                onChange={(e) => handleFilterChange('timeTo', e.target.value)}
              />
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <Button onClick={handleApplyFilters} loading={loading}>
              Aplicar Filtros
            </Button>
            <Button variant="secondary" onClick={handleClearFilters} disabled={loading}>
              Limpar
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : sales.length === 0 ? (
            <p className="text-center text-gray-500 py-16">Nenhuma venda encontrada</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">ID</th>
                    <th className="px-4 py-3 text-left">Itens</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                    <th className="px-4 py-3 text-center">Método Pagamento</th>
                    <th className="px-4 py-3 text-center">Data/Hora</th>
                    <th className="px-4 py-3 text-left">Vendedor</th>
                  </tr>
                </thead>
                <tbody>
                  {sales.map((sale) => (
                    <tr key={sale.id} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-xs">{sale.id}</td>
                      <td className="px-4 py-3 max-w-md">{sale.itemsSummary}</td>
                      <td className="px-4 py-3 text-right font-medium">
                        {formatCurrency(sale.totalAmount)}
                      </td>
                      <td className="px-4 py-3 text-center">{sale.paymentMethod}</td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        {formatSaleDateTime(sale.soldAt)}
                      </td>
                      <td className="px-4 py-3">
                        {sale.sellerName}
                        <span className="text-xs text-gray-500 block">ID: {sale.userId}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  );
};
