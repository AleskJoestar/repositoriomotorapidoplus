import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDepartments } from '@/hooks/useDepartments';
import { Toast } from '@/components/Toast';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import {
  departmentFormSchema,
  DepartmentFormData,
} from '@/schemas/departmentSchema';
import {
  CreateDepartmentRequest,
  UpdateDepartmentRequest,
  Department,
} from '@/services/departmentService';

export const DepartmentFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { fetchDepartmentById, createDepartment, updateDepartment } = useDepartments();
  const [department, setDepartment] = useState<Department | null>(null);
  const [positions, setPositions] = useState<string[]>(['']);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isEditing = !!id;
  const pageTitle = isEditing ? 'Editar Departamento' : 'Novo Departamento';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentFormSchema),
  });

  useEffect(() => {
    if (isEditing) {
      const load = async () => {
        setLoading(true);
        try {
          const data = await fetchDepartmentById(id!);
          if (data) {
            setDepartment(data);
            reset({ name: data.name });
            setPositions(data.positions.length > 0 ? data.positions.map((p) => p.name) : ['']);
          } else {
            setToast({ message: 'Departamento não encontrado', type: 'error' });
            setTimeout(() => navigate('/departments'), 2000);
          }
        } catch {
          setToast({ message: 'Erro ao carregar departamento', type: 'error' });
          setTimeout(() => navigate('/departments'), 2000);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, isEditing, fetchDepartmentById, navigate, reset]);

  const addPosition = () => setPositions((prev) => [...prev, '']);
  const removePosition = (index: number) =>
    setPositions((prev) => prev.filter((_, i) => i !== index));
  const updatePosition = (index: number, value: string) =>
    setPositions((prev) => prev.map((p, i) => (i === index ? value : p)));

  const onSubmit = async (data: DepartmentFormData) => {
    const filteredPositions = positions.map((p) => p.trim()).filter(Boolean);
    if (filteredPositions.length === 0) {
      setToast({ message: 'Informe ao menos um cargo', type: 'error' });
      return;
    }

    setSubmitting(true);
    try {
      if (isEditing && id) {
        const payload: UpdateDepartmentRequest = {
          name: data.name,
          positions: filteredPositions,
        };
        await updateDepartment(id, payload);
        setToast({ message: 'Departamento atualizado com sucesso!', type: 'success' });
      } else {
        const payload: CreateDepartmentRequest = {
          name: data.name!,
          positions: filteredPositions,
        };
        await createDepartment(payload);
        setToast({ message: 'Departamento criado com sucesso!', type: 'success' });
      }
      setTimeout(() => navigate('/departments'), 1500);
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error || 'Erro ao salvar departamento',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/departments')}
            className="text-indigo-600 hover:text-indigo-800 font-medium mb-4"
          >
            ← Voltar para Departamentos
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isEditing && department && (
              <FormInput label="ID" value={department.id} disabled onChange={() => {}} />
            )}

            <FormInput
              label="Nome do Departamento *"
              error={errors.name?.message}
              {...register('name')}
              disabled={submitting}
            />

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">Cargos *</label>
                <Button type="button" variant="secondary" onClick={addPosition}>
                  + Adicionar cargo
                </Button>
              </div>
              <div className="space-y-2">
                {positions.map((pos, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={pos}
                      onChange={(e) => updatePosition(index, e.target.value)}
                      placeholder="Nome do cargo"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      disabled={submitting}
                    />
                    {positions.length > 1 && (
                      <Button
                        type="button"
                        variant="danger"
                        onClick={() => removePosition(index)}
                        disabled={submitting}
                      >
                        Remover
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/departments')}>
                Cancelar
              </Button>
              <Button type="submit" loading={submitting}>
                {isEditing ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          </form>
        </div>

        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    </div>
  );
};
