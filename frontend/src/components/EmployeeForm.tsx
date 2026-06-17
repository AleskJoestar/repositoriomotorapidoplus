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
import { Employee, CreateEmployeeRequest, UpdateEmployeeRequest } from '@/types/employee';
import { FormInput } from './FormInput';
import { Button } from './Button';

interface EmployeeFormProps {
  employee?: Employee; // Se fornecido, é edição; caso contrário, criação
  onSubmit: (data: CreateEmployeeRequest | UpdateEmployeeRequest) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

type FormData = CreateEmployeeFormData | UpdateEmployeeFormData;

export const EmployeeForm: React.FC<EmployeeFormProps> = ({
  employee,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'contact'>('personal');
  const [formLoading, setFormLoading] = useState(false);
  const isEditing = !!employee;

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? updateEmployeeSchema : createEmployeeSchema),
    defaultValues: isEditing ? {
      name: employee.name,
      cpf: employee.cpf,
      rg: employee.rg,
      email: employee.email,
      phone: employee.phone,
      cargo: employee.cargo,
      department: employee.department,
      birthDate: employee.birthDate,
      hireDate: employee.hireDate,
      salary: employee.salary,
      address: employee.address,
    } : undefined,
  });

  const cpfValue = watch('cpf') || '';
  const phoneValue = watch('phone') || '';

  // Aplicar máscaras em tempo real
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

  const handleFormSubmit = async (data: FormData) => {
    setFormLoading(true);
    try {
      await onSubmit(data as CreateEmployeeRequest | UpdateEmployeeRequest);
    } finally {
      setFormLoading(false);
    }
  };

  const isLoading = loading || formLoading;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {/* Tabs */}
      <div className="flex gap-4 border-b mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'personal'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Dados Pessoais
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('professional')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'professional'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Dados Profissionais
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('contact')}
          className={`pb-2 px-4 font-medium transition-colors ${
            activeTab === 'contact'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Contato
        </button>
      </div>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        {/* ABA: DADOS PESSOAIS */}
        {activeTab === 'personal' && (
          <div className="space-y-4">
            {isEditing && (
              <FormInput
                label="ID do Funcionário"
                type="text"
                value={employee.id}
                disabled
              />
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

        {/* ABA: DADOS PROFISSIONAIS */}
        {activeTab === 'professional' && (
          <div className="space-y-4">
            <FormInput
              label="Cargo"
              placeholder="Mecânico"
              error={errors.cargo?.message}
              {...register('cargo')}
              disabled={isLoading}
            />

            <FormInput
              label="Departamento"
              placeholder="Manutenção"
              error={errors.department?.message}
              {...register('department')}
              disabled={isLoading}
            />

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
          </div>
        )}

        {/* ABA: CONTATO */}
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

        {/* Botões */}
        <div className="flex gap-3 justify-end mt-8 pt-6 border-t">
          {onCancel && (
            <Button
              type="button"
              variant="secondary"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading}
          >
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
};
