import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useUsers } from '@/hooks/useUsers';
import { employeeService } from '@/services/employeeService';
import { userService } from '@/services/userService';
import { Toast } from '@/components/Toast';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import {
  createSystemUserSchema,
  updateSystemUserSchema,
  CreateSystemUserFormData,
  UpdateSystemUserFormData,
} from '@/schemas/userSchema';
import { CreateSystemUserRequest, SystemUser, UpdateSystemUserRequest } from '@/types/user';
import { Employee } from '@/types/employee';

export const UserFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = !!id;
  const { createUser, updateUser } = useUsers();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loadingEmployees, setLoadingEmployees] = useState(!isEditing);
  const [loadingUser, setLoadingUser] = useState(isEditing);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const createForm = useForm<CreateSystemUserFormData>({
    resolver: zodResolver(createSystemUserSchema),
    defaultValues: {
      accessType: 'COMUM',
    },
  });

  const editForm = useForm<UpdateSystemUserFormData>({
    resolver: zodResolver(updateSystemUserSchema),
    defaultValues: {
      accessType: 'COMUM',
      senha: '',
    },
  });

  const createAccessType = createForm.watch('accessType');
  const editAccessType = editForm.watch('accessType');
  const isMasterSeed = user?.isMasterSeed ?? false;

  useEffect(() => {
    if (!isEditing) {
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
      return;
    }

    const loadUser = async () => {
      setLoadingUser(true);
      try {
        const data = await userService.getById(id!);
        setUser(data);
        editForm.reset({
          accessType: data.accessType,
          senha: '',
        });
      } catch {
        setToast({ message: 'Usuário não encontrado', type: 'error' });
        setTimeout(() => navigate('/users'), 2000);
      } finally {
        setLoadingUser(false);
      }
    };
    loadUser();
  }, [id, isEditing, navigate, editForm]);

  const onCreateSubmit = async (data: CreateSystemUserFormData) => {
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

  const onEditSubmit = async (data: UpdateSystemUserFormData) => {
    if (!id || isMasterSeed) return;

    setSubmitting(true);
    try {
      const parsed = updateSystemUserSchema.parse(data);
      const payload: UpdateSystemUserRequest = {
        accessType: parsed.accessType,
      };
      if (parsed.senha) {
        payload.senha = parsed.senha;
      }

      await updateUser(id, payload);
      setToast({ message: 'Usuário atualizado com sucesso!', type: 'success' });
      setTimeout(() => navigate('/users'), 1500);
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error || 'Erro ao atualizar usuário',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? 'Editar Usuário' : 'Novo Usuário'}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          {isEditing && user ? (
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              {isMasterSeed && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                  Usuário semente protegido — senha e privilégios não podem ser alterados.
                </div>
              )}

              <FormInput
                label="E-mail"
                type="email"
                value={user.email}
                disabled
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funcionário (vínculo)
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                  value={user.employeeName ? `${user.employeeName} (ID ${user.employeeId})` : 'Sem vínculo'}
                  disabled
                />
              </div>

              <FormInput
                label="Nova Senha (opcional)"
                type="password"
                placeholder="Deixe em branco para manter a atual"
                error={editForm.formState.errors.senha?.message}
                {...editForm.register('senha')}
                disabled={submitting || isMasterSeed}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Acesso *
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="MASTER"
                      {...editForm.register('accessType')}
                      checked={editAccessType === 'MASTER'}
                      disabled={submitting || isMasterSeed}
                    />
                    <span>Master</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="COMUM"
                      {...editForm.register('accessType')}
                      checked={editAccessType === 'COMUM'}
                      disabled={submitting || isMasterSeed}
                    />
                    <span>Comum</span>
                  </label>
                </div>
                {editForm.formState.errors.accessType && (
                  <p className="text-red-500 text-sm mt-1">
                    {editForm.formState.errors.accessType.message}
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="secondary" onClick={() => navigate('/users')}>
                  Cancelar
                </Button>
                {!isMasterSeed && (
                  <Button type="submit" loading={submitting}>
                    Atualizar
                  </Button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormInput
                label="E-mail *"
                type="email"
                error={createForm.formState.errors.email?.message}
                {...createForm.register('email')}
                disabled={submitting}
              />

              <FormInput
                label="Senha *"
                type="password"
                error={createForm.formState.errors.senha?.message}
                {...createForm.register('senha')}
                disabled={submitting}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Funcionário (vínculo)
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  {...createForm.register('employeeId')}
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
                      {...createForm.register('accessType')}
                      checked={createAccessType === 'MASTER'}
                      disabled={submitting}
                    />
                    <span>Master</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      value="COMUM"
                      {...createForm.register('accessType')}
                      checked={createAccessType === 'COMUM'}
                      disabled={submitting}
                    />
                    <span>Comum</span>
                  </label>
                </div>
                {createForm.formState.errors.accessType && (
                  <p className="text-red-500 text-sm mt-1">
                    {createForm.formState.errors.accessType.message}
                  </p>
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
          )}
        </div>

        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    </div>
  );
};
