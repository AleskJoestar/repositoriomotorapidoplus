import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { useCategories } from '@/hooks/useCategories';
import { Toast } from '@/components/Toast';
import { Button } from '@/components/Button';
import { Category } from '@/types/category';

export const Categories: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    categories,
    loading,
    error,
    fetchCategories,
    inactivateCategory,
    reactivateCategory,
    downloadReportPdf,
    downloadReportXml,
  } = useCategories();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [exporting, setExporting] = useState(false);
  const [deleteModal, setDeleteModal] = useState<{ category: Category; open: boolean }>({
    category: null as any,
    open: false,
  });
  const [deleting, setDeleting] = useState(false);
  const [reactivating, setReactivating] = useState(false);

  useEffect(() => {
    fetchCategories(true);
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
    if (!deleteModal.category) return;
    setDeleting(true);
    try {
      await inactivateCategory(String(deleteModal.category.id));
      setToast({ message: 'Categoria inativada com sucesso', type: 'success' });
      setDeleteModal({ category: null as any, open: false });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Erro ao inativar categoria',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  const handleReactivate = async (cat: Category) => {
    setReactivating(true);
    try {
      await reactivateCategory(String(cat.id));
      setToast({ message: 'Categoria reativada com sucesso', type: 'success' });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Erro ao reativar categoria',
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
              <h1 className="text-3xl font-bold text-gray-900">Categorias</h1>
              <p className="text-gray-600 mt-1">Gerencie categorias de peças</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" loading={exporting} onClick={() => handleExport('pdf')}>
                Exportar PDF
              </Button>
              <Button variant="secondary" loading={exporting} onClick={() => handleExport('xml')}>
                Exportar XML
              </Button>
              <button
                onClick={() => navigate('/categories/new')}
                className="bg-teal-600 hover:bg-teal-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                + Nova Categoria
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="h-8 w-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : categories.length === 0 ? (
              <div className="flex justify-center items-center h-64 text-gray-500">
                <p>Nenhuma categoria encontrada</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left">ID</th>
                      <th className="px-6 py-3 text-left">Nome</th>
                      <th className="px-6 py-3 text-left">Status</th>
                      <th className="px-6 py-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((cat) => (
                      <tr key={cat.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-3">{cat.id}</td>
                        <td className="px-6 py-3 font-medium">{cat.name}</td>
                        <td className="px-6 py-3">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                              cat.status === 'Ativo'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {cat.status}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex justify-center gap-2">
                            <button
                              onClick={() => navigate(`/categories/${cat.id}/edit`)}
                              className="w-8 h-8 rounded-lg hover:bg-blue-100"
                              title="Editar"
                            >
                              ✏️
                            </button>
                            {cat.status === 'Ativo' ? (
                              <button
                                onClick={() => setDeleteModal({ category: cat, open: true })}
                                className="w-8 h-8 rounded-lg hover:bg-red-100"
                                title="Inativar"
                              >
                                🗑️
                              </button>
                            ) : (
                              <button
                                onClick={() => handleReactivate(cat)}
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
            onClick={() => setDeleteModal({ category: null as any, open: false })}
          >
            <div
              className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-bold text-gray-900 mb-4">Confirmar Inativação</h2>
              <p className="text-gray-600 mb-6">
                Deseja inativar a categoria <strong>{deleteModal.category.name}</strong>?
              </p>
              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setDeleteModal({ category: null as any, open: false })}
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
