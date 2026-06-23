import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPartSchema,
  updatePartSchema,
  CreatePartFormData,
  UpdatePartFormData,
} from '@/schemas/partSchema';
import { Part, CreatePartRequest, UpdatePartRequest } from '@/types/part';
import { FormInput } from './FormInput';
import { Button } from './Button';

interface PartFormProps {
  part?: Part;
  onSubmit: (data: CreatePartRequest | UpdatePartRequest) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
}

type FormData = CreatePartFormData | UpdatePartFormData;

export const PartForm: React.FC<PartFormProps> = ({
  part,
  onSubmit,
  loading = false,
  onCancel,
}) => {
  const isEditing = !!part;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? updatePartSchema : createPartSchema),
    defaultValues: isEditing
      ? {
          name: part.name,
          category: part.category,
          quantity: part.quantity,
          description: part.description || '',
          manufacturer: part.manufacturer || '',
          serialNumber: part.serialNumber || '',
          location: part.location || '',
          minQuantity: part.minQuantity ?? undefined,
        }
      : undefined,
  });

  const handleFormSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      description: data.description || undefined,
      manufacturer: data.manufacturer || undefined,
      serialNumber: data.serialNumber || undefined,
      location: data.location || undefined,
      minQuantity:
        data.minQuantity === '' || data.minQuantity === undefined
          ? undefined
          : Number(data.minQuantity),
    };

    await onSubmit(payload as CreatePartRequest | UpdatePartRequest);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {isEditing && (
        <div className="mb-6">
          <FormInput
            label="Código"
            value={part.code}
            disabled
            onChange={() => {}}
          />
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput
            label="Nome da Peça *"
            error={errors.name?.message}
            {...register('name')}
          />
          <FormInput
            label="Categoria *"
            error={errors.category?.message}
            {...register('category')}
          />
          <FormInput
            label="Quantidade em Estoque *"
            type="number"
            error={errors.quantity?.message}
            {...register('quantity', { valueAsNumber: true })}
          />
          <FormInput
            label="Quantidade Mínima"
            type="number"
            error={errors.minQuantity?.message}
            {...register('minQuantity', { valueAsNumber: true })}
          />
          <FormInput
            label="Fabricante"
            error={errors.manufacturer?.message}
            {...register('manufacturer')}
          />
          <FormInput
            label="Número de Série"
            error={errors.serialNumber?.message}
            {...register('serialNumber')}
          />
        </div>

        <FormInput
          label="Localização no Estoque"
          error={errors.location?.message}
          {...register('location')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Descrição
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            {...register('description')}
          />
        </div>

        <div className="flex gap-3 justify-end pt-4">
          {onCancel && (
            <Button type="button" variant="secondary" onClick={onCancel}>
              Cancelar
            </Button>
          )}
          <Button type="submit" loading={loading}>
            {isEditing ? 'Atualizar' : 'Salvar'}
          </Button>
        </div>
      </form>
    </div>
  );
};
