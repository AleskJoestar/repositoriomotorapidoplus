import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  maskCPF,
  maskPhone,
  CreateEmployeeFormData,
  UpdateEmployeeFormData,
} from '@/schemas/employeeSchema';
import {
  Employee,
  CreateEmployeeRequest,
  UpdateEmployeeRequest,
  Position,
} from '@/types/employee';
import { departmentService } from '@/services/departmentService';
import { getFirstValidationMessage } from '@/utils/formValidation';
import { FormInput } from './FormInput';
import { Button } from './Button';

interface EmployeeFormProps {
  employee?: Employee;
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
  onValidationError?: (message: string) => void;
}

type FormData = CreateEmployeeFormData | UpdateEmployeeFormData;

const getDepartmentName = (employee: Employee) =>
  employee.departmentName || employee.department?.name || '';

const getPositionName = (employee: Employee) =>
  employee.positionName || employee.position?.name || '';

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  loading = false,
  onCancel,
  onValidationError,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'contact'>('personal');
  const [formLoading, setFormLoading] = useState(false);
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(false);
  const isEditing = !!employee;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? updateEmployeeSchema : createEmployeeSchema),
    defaultValues: isEditing
      ? {
          name: employee.name,
          cpf: employee.cpf,
          rg: employee.rg,
          email: employee.email,
          phone: employee.phone,
          departmentId: employee.departmentId,
          positionId: employee.positionId,
          birthDate: employee.birthDate?.slice(0, 10),
          hireDate: employee.hireDate?.slice(0, 10),
          salary: employee.salary,
          address: employee.address,
        }
      : {},
  });

  const cpfValue = watch('cpf') || '';
  const phoneValue = watch('phone') || '';
  const departmentId = watch('departmentId');

  useEffect(() => {
    const loadDepartments = async () => {
      setLoadingDepartments(true);
      try {
        const data = await departmentService.getActiveOptions();
        setDepartments(data);
      } catch {
        setDepartments([]);
      } finally {
        setLoadingDepartments(false);
      }
    };
    loadDepartments();
  }, []);

  useEffect(() => {
    if (cpfValue && cpfValue.length > 0) {
      const masked = maskCPF(cpfValue);
      if (masked !== cpfValue) {
        setValue('cpf', masked);
      }
    }
  }, [cpfValue, setValue]);

  useEffect(() => {
    if (phoneValue && phoneValue.length > 0) {
      const masked = maskPhone(phoneValue);
      if (masked !== phoneValue) {
        setValue('phone', masked);
      }
    }
  }, [phoneValue, setValue]);

  useEffect(() => {
    const loadPositions = async () => {
      if (!departmentId || Number(departmentId) <= 0) {
        setPositions([]);
        return;
      }
      setLoadingPositions(true);
      try {
        const data = await departmentService.getPositions(Number(departmentId));
        setPositions(data);
      } catch {
        setPositions([]);
      } finally {
        setLoadingPositions(false);
      }
    };
    loadPositions();
  }, [departmentId]);

  useEffect(() => {
    if (!isEditing && departmentId) {
      setValue('positionId', '' as unknown as number);
    }
  }, [departmentId, isEditing, setValue]);

  const handleFormSubmit = async (data: FormData) => {
    setFormLoading(true);
    try {
      await onSubmit(data as CreateEmployeeRequest | UpdateEmployeeRequest);
    } finally {
      setFormLoading(false);
    }
  };

  const handleInvalidSubmit = (formErrors: typeof errors) => {
    const message = getFirstValidationMessage(formErrors);
    if (message) {
      onValidationError?.(message);
    }
  };

  const isLoading = loading || formLoading;
  const selectClass = (hasError?: boolean) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError ? 'border-red-500' : 'border-gray-300'
    } ${isLoading ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex gap-4 border-b mb-6">
        {(['personal', 'professional', 'contact'] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`pb-2 px-4 font-medium transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            {tab === 'personal' && 'Dados Pessoais'}
            {tab === 'professional' && 'Dados Profissionais'}
            {tab === 'contact' && 'Contato'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)}>
        {activeTab === 'personal' && (
          <div className="space-y-4">
            {isEditing && (
              <FormInput label="ID do Funcionário" type="text" value={employee.id} disabled />
            )}

            <FormInput
              label="Nome Completo"
              placeholder="João Silva Santos"
              error={errors.name?.message}
              {...register('name')}
              disabled={isLoading}
            />

            <FormInput
              label="CPF"
              placeholder="000.000.000-00"
              error={errors.cpf?.message}
              {...register('cpf')}
              disabled={isLoading}
              maxLength={14}
            />

            <FormInput
              label="RG"
              placeholder="1234567"
              error={errors.rg?.message}
              {...register('rg')}
              disabled={isLoading}
            />

            <FormInput
              label="Data de Nascimento"
              type="date"
              error={errors.birthDate?.message}
              {...register('birthDate')}
              disabled={isLoading}
            />
          </div>
        )}

        {activeTab === 'professional' && (
          <div className="space-y-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Departamento
              </label>
              <select
                className={selectClass(!!errors.departmentId)}
                {...register('departmentId')}
                disabled={isLoading || loadingDepartments}
              >
                <option value="">Selecione um departamento</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              {errors.departmentId && (
                <p className="text-red-500 text-sm mt-1">{errors.departmentId.message}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Cargo</label>
              <select
                className={selectClass(!!errors.positionId)}
                {...register('positionId')}
                disabled={isLoading || loadingPositions || !departmentId}
              >
                <option value="">
                  {departmentId ? 'Selecione um cargo' : 'Selecione o departamento primeiro'}
                </option>
                {positions.map((pos) => (
                  <option key={pos.id} value={pos.id}>
                    {pos.name}
                  </option>
                ))}
              </select>
              {errors.positionId && (
                <p className="text-red-500 text-sm mt-1">{errors.positionId.message}</p>
              )}
            </div>

            <FormInput
              label="Data de Admissão"
              type="date"
              error={errors.hireDate?.message}
              {...register('hireDate')}
              disabled={isLoading}
            />

            <FormInput
              label="Salário"
              type="number"
              placeholder="0.00"
              step="0.01"
              error={errors.salary?.message}
              {...register('salary', { valueAsNumber: true })}
              disabled={isLoading}
            />

            {isEditing && (
              <div className="text-sm text-gray-500">
                Vínculo atual: {getDepartmentName(employee)} / {getPositionName(employee)}
              </div>
            )}
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="space-y-4">
            <FormInput
              label="E-mail"
              type="email"
              placeholder="seu@email.com"
              error={errors.email?.message}
              {...register('email')}
              disabled={isLoading}
            />

            <FormInput
              label="Telefone"
              placeholder="(11) 99999-9999"
              error={errors.phone?.message}
              {...register('phone')}
              disabled={isLoading}
              maxLength={15}
            />

            <FormInput
              label="Endereço Completo"
              placeholder="Rua Principal, 123, Apt 456, São Paulo, SP"
              error={errors.address?.message}
              {...register('address')}
              disabled={isLoading}
            />
          </div>
        )}

        <div className="flex gap-3 justify-end mt-8 pt-6 border-t">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
              Cancelar
            </Button>
          )}
          <Button type="submit" loading={isLoading} disabled={isLoading}>
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
};
