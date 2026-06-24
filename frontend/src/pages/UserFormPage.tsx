import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUsers } from '@/hooks/useUsers';
import { employeeService } from '@/services/employeeService';
import { Toast } from '@/components/Toast';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { createSystemUserSchema, CreateSystemUserFormData } from '@/schemas/userSchema';
import { CreateSystemUserRequest } from '@/types/user';
import { Employee } from '@/types/employee';

export const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { createUser } = useUsers();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<CreateSystemUserFormData>({
    resolver: zodResolver(createSystemUserSchema),
    defaultValues: {
      accessType: 'COMUM',
    },
  });

  const accessType = watch('accessType');

  useEffect(() => {
    const loadEmployees = async () => {
      setLoadingEmployees(true);
      try {
        const data = await employeeService.getAllEmployees({ status: 'Ativo' });
        setEmployees(data);
      } catch {
        setEmployees([]);
      } finally {
        setLoadingEmployees(false);
      }
    };
    loadEmployees();
  }, []);

  const onSubmit = async (data: CreateSystemUserFormData) => {
    setSubmitting(true);
    try {
      const payload: CreateSystemUserRequest = {
        email: data.email,
        senha: data.senha,
        accessType: data.accessType,
        employeeId:
          data.employeeId && Number(data.employeeId) > 0
            ? Number(data.employeeId)
            : undefined,
      };
      await createUser(payload);
      setToast({ message: 'Usuário criado com sucesso!', type: 'success' });
      setTimeout(() => navigate('/users'), 1500);
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error || 'Erro ao criar usuário',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/users')}
            className="text-purple-600 hover:text-purple-800 font-medium mb-4"
          >
            ← Voltar para Usuários
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Novo Usuário</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormInput
              label="E-mail *"
              type="email"
              error={errors.email?.message}
              {...register('email')}
              disabled={submitting}
            />

            <FormInput
              label="Senha *"
              type="password"
              error={errors.senha?.message}
              {...register('senha')}
              disabled={submitting}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Funcionário (vínculo)
              </label>
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                {...register('employeeId')}
                disabled={submitting || loadingEmployees}
              >
                <option value="">Sem vínculo</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.name} (ID {emp.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Acesso *
              </label>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="MASTER"
                    {...register('accessType')}
                    checked={accessType === 'MASTER'}
                    disabled={submitting}
                  />
                  <span>Master</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    value="COMUM"
                    {...register('accessType')}
                    checked={accessType === 'COMUM'}
                    disabled={submitting}
                  />
                  <span>Comum</span>
                </label>
              </div>
              {errors.accessType && (
                <p className="text-red-500 text-sm mt-1">{errors.accessType.message}</p>
              )}
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
                Cancelar
              </Button>
              <Button type="submit" loading={submitting}>
                Salvar
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
