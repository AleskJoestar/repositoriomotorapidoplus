import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useParts } from '@/hooks/useParts';
import { usePermissions } from '@/hooks/usePermissions';
import { Toast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { Part, PartFilters, LOW_STOCK_THRESHOLD, formatPartPrice } from '@/types/part';

const DEFAULT_PART_FILTERS: PartFilters = { status: 'todos' };

export const Parts: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const { canInactivate, canAccessReports, canManageParts } = usePermissions();
  const {
    parts,
    loading,
    error,
    fetchParts,
    deletePart,
    reactivatePart,
    downloadReportPdf,
    downloadReportXlsx,
  } = useParts();

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [filters, setFilters] = useState<PartFilters>(DEFAULT_PART_FILTERS);
  const [deleteModal, setDeleteModal] = useState<{ part: Part; open: boolean }>({
    part: null as any,
    open: false,
  });
  const [deleting, setDeleting] = useState(false);
  const [reactivating, setReactivating] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchParts(DEFAULT_PART_FILTERS);
  }, []);

  useEffect(() => {
    if (error) {
      setToast({ message: error, type: 'error' });
    }
  }, [error]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleFilterChange = (newFilters: PartFilters) => {
    setFilters(newFilters);
    fetchParts(newFilters);
  };

  const handleInactivateClick = (part: Part) => {
    setDeleteModal({ part, open: true });
  };

  const handleConfirmInactivate = async () => {
    if (!deleteModal.part) return;
    setDeleting(true);
    try {
      const result = await deletePart(String(deleteModal.part.id));
      setToast({ message: result.message, type: 'success' });
      setDeleteModal({ part: null as any, open: false });
      fetchParts(filters);
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Erro ao inativar peça',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleReactivate = async (part: Part) => {
    setReactivating(true);
    try {
      await reactivatePart(String(part.id));
      setToast({ message: 'Peça reativada com sucesso', type: 'success' });
      fetchParts(filters);
    } catch {
      setToast({ message: 'Erro ao reativar peça', type: 'error' });
    } finally {
      setReactivating(false);
    }
  };

  const handleExport = async (format: 'pdf' | 'xlsx') => {
    setExporting(true);
    try {
      if (format === 'pdf') {
        await downloadReportPdf(filters);
      } else {
        await downloadReportXlsx(filters);
      }
      setToast({ message: 'Relatório exportado com sucesso', type: 'success' });
    } catch {
      setToast({ message: 'Erro ao exportar relatório', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const isLowStock = (part: Part) => part.quantity <= LOW_STOCK_THRESHOLD;

  const getCategoryLabel = (part: Part) =>
    part.categoryName || part.category?.name || '-';

  const getManufacturerLabel = (part: Part) =>
    part.manufacturerName || part.manufacturer?.name || '-';

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">MotoRapido PLUS</h1>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => navigate('/sales')}>
              Caixa
            </Button>
            {user?.accessType === 'MASTER' && (
              <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                ← Voltar ao Início
              </Button>
            )}
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </nav>

      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Produtos / Estoque</h1>
              <p className="text-gray-600 mt-1">Gerencie o inventário de produtos</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {canAccessReports && (
                <>
                  <Button variant="secondary" loading={exporting} onClick={() => handleExport('pdf')}>
                    Exportar PDF
                  </Button>
                  <Button variant="secondary" loading={exporting} onClick={() => handleExport('xlsx')}>
                    Exportar XLSX
                  </Button>
                </>
              )}
              {canManageParts && (
                <button
                  onClick={() => navigate('/parts/new')}
                  className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  + Novo Produto
                </button>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Categoria..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.category || ''}
                onChange={(e) =>
                  handleFilterChange({ ...filters, category: e.target.value || undefined })
                }
              />
              <input
                type="text"
                placeholder="Fabricante..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.manufacturer || ''}
                onChange={(e) =>
                  handleFilterChange({ ...filters, manufacturer: e.target.value || undefined })
                }
              />
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                value={filters.status || 'todos'}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    status: e.target.value === 'todos' ? 'todos' : e.target.value,
                  })
                }
              >
                <option value="todos">Todos os status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={filters.lowStock === 'true'}
                  onChange={(e) =>
                    handleFilterChange({
                      ...filters,
                      lowStock: e.target.checked ? 'true' : undefined,
                    })
                  }
                />
                Alerta estoque baixo (≤ {LOW_STOCK_THRESHOLD})
              </label>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin">
                  <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full"></div>
                </div>
              </div>
            ) : parts.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-gray-500">
                <p>Nenhuma peça encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">Código</th>
                      <th className="px-6 py-3 text-left">Nome</th>
                      <th className="px-6 py-3 text-left">Categoria</th>
                      <th className="px-6 py-3 text-left">Fabricante</th>
                      <th className="px-6 py-3 text-left">Qtd</th>
                      <th className="px-6 py-3 text-left">Preço</th>
                      <th className="px-6 py-3 text-left">Localização</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      {canManageParts && (
                        <th className="px-6 py-3 text-center">Ações</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {parts.map((part) => (
                      <tr key={part.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3 font-mono">{part.code}</td>
                        <td className="px-6 py-3 font-medium">
                          {part.name}
                          {isLowStock(part) && (
                            <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              Baixo
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-3">{getCategoryLabel(part)}</td>
                        <td className="px-6 py-3">{getManufacturerLabel(part)}</td>
                        <td className="px-6 py-3">{part.quantity}</td>
                        <td className="px-6 py-3">{formatPartPrice(part.price)}</td>
                        <td className="px-6 py-3">{part.location || '-'}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              part.status === 'Ativo'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {part.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          {canManageParts && (
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => navigate(`/parts/${part.id}/edit`)}
                                className="w-8 h-8 rounded-lg hover:bg-blue-100"
                                title="Editar"
                              >
                                ✏️
                              </button>
                              {canInactivate &&
                                (part.status === 'Ativo' ? (
                                  <button
                                    onClick={() => handleInactivateClick(part)}
                                    className="w-8 h-8 rounded-lg hover:bg-red-100"
                                    title="Inativar"
                                  >
                                    🗑️
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleReactivate(part)}
                                    disabled={reactivating}
                                    className="w-8 h-8 rounded-lg hover:bg-green-100"
                                    title="Reativar"
                                  >
                                    ♻️
                                  </button>
                                ))}
                            </div>
                          )}
                          {!canManageParts && <span className="text-gray-400">—</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {deleteModal.open && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
            onClick={() => setDeleteModal({ part: null as any, open: false })}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Inativar Peça</h2>
              <p className="text-gray-600 mb-6">
                Deseja inativar a peça <strong>{deleteModal.part.name}</strong>?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteModal({ part: null as any, open: false })}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button variant="danger" onClick={handleConfirmInactivate} loading={deleting}>
                  Inativar Peça
                </Button>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    </div>
  );
};
