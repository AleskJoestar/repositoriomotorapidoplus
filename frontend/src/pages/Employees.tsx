import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmployees } from '@/hooks/useEmployees';
import { ConfirmDeleteModal } from '@/components/ConfirmDeleteModal';
import { Toast } from '@/components/Toast';
import { Employee, EmployeeFilters } from '@/types/employee';

export const Employees: React.FC = () => {
  const navigate = useNavigate();
  const { employees, loading, error, fetchEmployees, deleteEmployee } = useEmployees();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [deleteModal, setDeleteModal] = useState<{ employee: Employee; open: boolean }>({
    employee: null as any,
    open: false,
  });
  const [deleting, setDeleting] = useState(false);

  // Filtros
  const [filters, setFilters] = useState<EmployeeFilters>({});

  // Carregar funcionários ao montar
  useEffect(() => {
    fetchEmployees(filters);
  }, []);

  // Lidar com erro
  useEffect(() => {
    if (error) {
      setToast({ message: error, type: 'error' });
    }
  }, [error]);

  // Aplicar filtros
  const handleFilterChange = (newFilters: EmployeeFilters) => {
    setFilters(newFilters);
    fetchEmployees(newFilters);
  };

  // Abrir modal de deletar
  const handleDeleteClick = (employee: Employee) => {
    setDeleteModal({ employee, open: true });
  };

  // Confirmar deleção
  const handleConfirmDelete = async () => {
    if (!deleteModal.employee) return;
    setDeleting(true);
    try {
      await deleteEmployee(deleteModal.employee.id);
      setToast({
        message: `Funcionário ${deleteModal.employee.name} inativado com sucesso`,
        type: 'success',
      });
      setDeleteModal({ employee: null as any, open: false });
    } catch (err: any) {
      setToast({
        message: err.response?.data?.error || 'Erro ao inativar funcionário',
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  // Formatar data
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  // Formatar CPF
  const formatCPF = (cpf: string) => {
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Funcionários</h1>
            <p className="text-gray-600 mt-1">Gerencie os funcionários da oficina</p>
          </div>
          <button
            onClick={() => navigate('/employees/new')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + Novo Funcionário
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Filtros</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Cargo
              </label>
              <input
                type="text"
                placeholder="Filtrar por cargo..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.cargo || ''}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    cargo: e.target.value || undefined,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Departamento
              </label>
              <input
                type="text"
                placeholder="Filtrar por departamento..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.department || ''}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    department: e.target.value || undefined,
                  })
                }
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.status || ''}
                onChange={(e) =>
                  handleFilterChange({
                    ...filters,
                    status: (e.target.value as 'Ativo' | 'Inativo' | undefined) || undefined,
                  })
                }
              >
                <option value="">Todos os status</option>
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin">
                <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div>
              </div>
            </div>
          ) : employees.length === 0 ? (
            <div className="flex justify-center items-center h-64 text-gray-500">
              <p>Nenhum funcionário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">ID</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Nome</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">CPF</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Cargo</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Departamento</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Admissão</th>
                    <th className="px-6 py-3 text-left font-medium text-gray-700">Status</th>
                    <th className="px-6 py-3 text-center font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="border-b hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-3 text-gray-900">{employee.id}</td>
                      <td className="px-6 py-3 text-gray-900 font-medium">{employee.name}</td>
                      <td className="px-6 py-3 text-gray-600">{formatCPF(employee.cpf.replace(/\D/g, ''))}</td>
                      <td className="px-6 py-3 text-gray-600">{employee.cargo}</td>
                      <td className="px-6 py-3 text-gray-600">{employee.department}</td>
                      <td className="px-6 py-3 text-gray-600">{formatDate(employee.hireDate)}</td>
                      <td className="px-6 py-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            employee.status === 'Ativo'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {employee.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => navigate(`/employees/${employee.id}/edit`)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-blue-100 text-blue-600 transition-colors"
                            title="Editar"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteClick(employee)}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                            title="Inativar"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de confirmação */}
        {deleteModal.open && (
          <ConfirmDeleteModal
            employeeName={deleteModal.employee.name}
            onConfirm={handleConfirmDelete}
            onCancel={() => setDeleteModal({ employee: null as any, open: false })}
            loading={deleting}
          />
        )}

        {/* Toast */}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </div>
  );
};
