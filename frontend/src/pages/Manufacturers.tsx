import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useManufacturers } from '@/hooks/useManufacturers';
import { Toast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { Manufacturer } from '@/types/manufacturer';

export const Manufacturers: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    manufacturers,
    loading,
    error,
    fetchManufacturers,
    inactivateManufacturer,
    reactivateManufacturer,
    downloadReportPdf,
    downloadReportXml,
  } = useManufacturers();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ manufacturer: Manufacturer; open: boolean }>({
    manufacturer: null as any,
    open: false,
  });
  const [deleting, setDeleting] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  useEffect(() => {
    fetchManufacturers(true);
  }, []);

  useEffect(() => {
    if (error) setToast({ message: error, type: 'error' });
  }, [error]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleExport = async (format: 'pdf' | 'xml') => {
    setExporting(true);
    try {
      if (format === 'pdf') await downloadReportPdf();
      else await downloadReportXml();
      setToast({ message: 'Relatório exportado com sucesso', type: 'success' });
    } catch {
      setToast({ message: 'Erro ao exportar relatório', type: 'error' });
    } finally {
      setExporting(false);
    }
  };

  const handleConfirmInactivate = async () => {
    if (!deleteModal.manufacturer) return;
    setDeleting(true);
    try {
      await inactivateManufacturer(String(deleteModal.manufacturer.id));
      setToast({ message: 'Fabricante inativado com sucesso', type: 'success' });
      setDeleteModal({ manufacturer: null as any, open: false });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Erro ao inativar fabricante',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleReactivate = async (man: Manufacturer) => {
    setReactivating(true);
    try {
      await reactivateManufacturer(String(man.id));
      setToast({ message: 'Fabricante reativado com sucesso', type: 'success' });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Erro ao reativar fabricante',
        type: 'error',
      });
    } finally {
      setReactivating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">MotoRapido PLUS</h1>
          <div className="flex gap-4">
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              ← Voltar ao Início
            </Button>
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
              <h1 className="text-3xl font-bold text-gray-900">Fabricantes</h1>
              <p className="text-gray-600 mt-1">Gerencie fabricantes de peças</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" loading={exporting} onClick={() => handleExport('pdf')}>
                Exportar PDF
              </Button>
              <Button variant="secondary" loading={exporting} onClick={() => handleExport('xml')}>
                Exportar XML
              </Button>
              <button
                onClick={() => navigate('/manufacturers/new')}
                className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                + Novo Fabricante
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : manufacturers.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-gray-500">
                <p>Nenhum fabricante encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">ID</th>
                      <th className="px-6 py-3 text-left">Nome</th>
                      <th className="px-6 py-3 text-left">CNPJ</th>
                      <th className="px-6 py-3 text-left">Contato</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {manufacturers.map((man) => (
                      <tr key={man.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3">{man.id}</td>
                        <td className="px-6 py-3 font-medium">{man.name}</td>
                        <td className="px-6 py-3">{man.cnpj || '-'}</td>
                        <td className="px-6 py-3">{man.contact || '-'}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              man.status === 'Ativo'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {man.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => navigate(`/manufacturers/${man.id}/edit`)}
                              className="w-8 h-8 rounded-lg hover:bg-blue-100"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            {man.status === 'Ativo' ? (
                              <button
                                onClick={() => setDeleteModal({ manufacturer: man, open: true })}
                                className="w-8 h-8 rounded-lg hover:bg-red-100"
                                title="Inativar"
                              >
                                🗑️
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(man)}
                                disabled={reactivating}
                                className="w-8 h-8 rounded-lg hover:bg-green-100"
                                title="Reativar"
                              >
                                ♻️
                              </button>
                            )}
                          </div>
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
            onClick={() => setDeleteModal({ manufacturer: null as any, open: false })}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Confirmar Inativação</h2>
              <p className="text-gray-600 mb-6">
                Deseja inativar o fabricante <strong>{deleteModal.manufacturer.name}</strong>?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteModal({ manufacturer: null as any, open: false })}
                  disabled={deleting}
                >
                  Cancelar
                </Button>
                <Button variant="danger" onClick={handleConfirmInactivate} loading={deleting}>
                  Inativar
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
