import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useManufacturers } from '@/hooks/useManufacturers';
import { manufacturerService } from '@/services/manufacturerService';
import { Toast } from '@/components/Toast';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import {
  createManufacturerSchema,
  updateManufacturerSchema,
  CreateManufacturerFormData,
  UpdateManufacturerFormData,
} from '@/schemas/manufacturerSchema';
import {
  CreateManufacturerRequest,
  UpdateManufacturerRequest,
  Manufacturer,
} from '@/types/manufacturer';

export const ManufacturerFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { createManufacturer, updateManufacturer } = useManufacturers();
  const [manufacturer, setManufacturer] = useState<Manufacturer | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isEditing = !!id;
  const pageTitle = isEditing ? 'Editar Fabricante' : 'Novo Fabricante';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateManufacturerFormData | UpdateManufacturerFormData>({
    resolver: zodResolver(isEditing ? updateManufacturerSchema : createManufacturerSchema),
  });

  useEffect(() => {
    if (isEditing) {
      const load = async () => {
        setLoading(true);
        try {
          const all = await manufacturerService.getAll(true);
          const found = all.find((m) => m.id === Number(id));
          if (found) {
            setManufacturer(found);
            reset({
              name: found.name,
              cnpj: found.cnpj || '',
              address: found.address || '',
              contact: found.contact || '',
            });
          } else {
            setToast({ message: 'Fabricante não encontrado', type: 'error' });
            setTimeout(() => navigate('/manufacturers'), 2000);
          }
        } catch {
          setToast({ message: 'Erro ao carregar fabricante', type: 'error' });
          setTimeout(() => navigate('/manufacturers'), 2000);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, isEditing, navigate, reset]);

  const onSubmit = async (data: CreateManufacturerFormData | UpdateManufacturerFormData) => {
    setSubmitting(true);
    try {
      const payload = {
        name: data.name!,
        cnpj: data.cnpj || undefined,
        address: data.address || undefined,
        contact: data.contact || undefined,
      };

      if (isEditing && id) {
        await updateManufacturer(id, payload as UpdateManufacturerRequest);
        setToast({ message: 'Fabricante atualizado com sucesso!', type: 'success' });
      } else {
        await createManufacturer(payload as CreateManufacturerRequest);
        setToast({ message: 'Fabricante criado com sucesso!', type: 'success' });
      }
      setTimeout(() => navigate('/manufacturers'), 1500);
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error || 'Erro ao salvar fabricante',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/manufacturers')}
            className="text-amber-600 hover:text-amber-800 font-medium mb-4"
          >
            ← Voltar para Fabricantes
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isEditing && manufacturer && (
              <FormInput label="ID" value={manufacturer.id} disabled onChange={() => {}} />
            )}

            <FormInput
              label="Nome *"
              error={errors.name?.message}
              {...register('name')}
              disabled={submitting}
            />
            <FormInput
              label="CNPJ"
              error={errors.cnpj?.message}
              {...register('cnpj')}
              disabled={submitting}
            />
            <FormInput
              label="Endereço"
              error={errors.address?.message}
              {...register('address')}
              disabled={submitting}
            />
            <FormInput
              label="Contato"
              error={errors.contact?.message}
              {...register('contact')}
              disabled={submitting}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/manufacturers')}>
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
