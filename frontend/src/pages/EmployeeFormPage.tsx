import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEmployees } from '@/hooks/useEmployees';
import { EmployeeForm } from '@/components/EmployeeForm';
import { Toast } from '@/components/Toast';
import { CreateEmployeeRequest, UpdateEmployeeRequest, Employee } from '@/types/employee';

export const EmployeeFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { fetchEmployeeById, createEmployee, updateEmployee } = useEmployees();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [loading, setLoading] = useState(!!id); // Carrega se for edição
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isEditing = !!id;
  const pageTitle = isEditing ? 'Editar Funcionário' : 'Novo Funcionário';

  // Carregar funcionário se for edição
  useEffect(() => {
    if (isEditing) {
      const loadEmployee = async () => {
        setLoading(true);
        try {
          const data = await fetchEmployeeById(id!);
          if (data) {
            setEmployee(data);
          } else {
            setToast({
              message: 'Funcionário não encontrado',
              type: 'error',
            });
            setTimeout(() => navigate('/employees'), 2000);
          }
        } catch (err) {
          setToast({
            message: 'Erro ao carregar funcionário',
            type: 'error',
          });
          setTimeout(() => navigate('/employees'), 2000);
        } finally {
          setLoading(false);
        }
      };

      loadEmployee();
    }
  }, [id, isEditing, fetchEmployeeById, navigate]);

  // Lidar com submit do formulário
  const handleSubmit = async (data: CreateEmployeeRequest | UpdateEmployeeRequest) => {
    setSubmitting(true);
    try {
      if (isEditing && id) {
        await updateEmployee(id, data as UpdateEmployeeRequest);
        setToast({
          message: 'Funcionário atualizado com sucesso!',
          type: 'success',
        });
      } else {
        await createEmployee(data as CreateEmployeeRequest);
        setToast({
          message: 'Funcionário criado com sucesso!',
          type: 'success',
        });
      }

      // Redirecionar após 1.5s
      setTimeout(() => navigate('/employees'), 1500);
    } catch (error: any) {
      const message =
        error.response?.data?.error ||
        (isEditing ? 'Erro ao atualizar funcionário' : 'Erro ao criar funcionário');
      setToast({
        message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin">
          <div className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Cabeçalho */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/employees')}
            className="text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            ← Voltar para Funcionários
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        {/* Formulário */}
        <EmployeeForm
          employee={employee || undefined}
          onSubmit={handleSubmit}
          loading={submitting}
          onCancel={() => navigate('/employees')}
        />

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
