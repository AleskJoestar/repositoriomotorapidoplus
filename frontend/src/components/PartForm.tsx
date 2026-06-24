import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createPartSchema,
  updatePartSchema,
  CreatePartFormData,
  UpdatePartFormData,
} from '@/schemas/partSchema';
import { Part, CreatePartRequest, UpdatePartRequest } from '@/types/part';
import { categoryService } from '@/services/categoryService';
import { manufacturerService } from '@/services/manufacturerService';
import { getFirstValidationMessage, PART_FIELD_LABELS } from '@/utils/formValidation';
import { FormInput } from './FormInput';
import { Button } from './Button';

interface PartFormProps {
  part?: Part;
  onSubmit: (data: CreatePartRequest | UpdatePartRequest) => Promise<void>;
  loading?: boolean;
  onCancel?: () => void;
  onValidationError?: (message: string) => void;
}

type FormData = CreatePartFormData | UpdatePartFormData;

export const PartForm: React.FC<PartFormProps> = ({
  part,
  onSubmit,
  loading = false,
  onCancel,
  onValidationError,
}) => {
  const isEditing = !!part;
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [manufacturers, setManufacturers] = useState<{ id: number; name: string }[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(isEditing ? updatePartSchema : createPartSchema),
    defaultValues: isEditing
      ? {
          name: part.name,
          categoryId: part.categoryId,
          manufacturerId: part.manufacturerId,
          quantity: part.quantity,
          description: part.description || '',
          serialNumber: part.serialNumber || '',
          location: part.location || '',
          minQuantity: part.minQuantity,
          price: part.price ?? 0,
        }
      : {
          minQuantity: 1,
          price: 0,
        },
  });

  useEffect(() => {
    const loadOptions = async () => {
      setLoadingOptions(true);
      try {
        const [cats, mans] = await Promise.all([
          categoryService.getAll(false),
          manufacturerService.getAll(false),
        ]);
        setCategories(cats);
        setManufacturers(mans);
      } catch {
        setCategories([]);
        setManufacturers([]);
      } finally {
        setLoadingOptions(false);
      }
    };
    loadOptions();
  }, []);

  const handleFormSubmit = async (data: FormData) => {
    const payload = {
      ...data,
      description: data.description || undefined,
      serialNumber: data.serialNumber || undefined,
      location: data.location || undefined,
      minQuantity: Number(data.minQuantity),
    };

    await onSubmit(payload as CreatePartRequest | UpdatePartRequest);
  };

  const handleInvalidSubmit = (formErrors: typeof errors) => {
    const message = getFirstValidationMessage(formErrors, PART_FIELD_LABELS);
    if (message) {
      onValidationError?.(message);
    }
  };

  const selectClass = (hasError?: boolean) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      hasError ? 'border-red-500' : 'border-gray-300'
    } ${loading || loadingOptions ? 'bg-gray-100 cursor-not-allowed' : ''}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {isEditing && (
        <div className="mb-6">
          <FormInput label="Código" value={part.code} disabled onChange={() => {}} />
        </div>
      )}

      <form onSubmit={handleSubmit(handleFormSubmit, handleInvalidSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormInput label="Nome do Produto *" error={errors.name?.message} {...register('name')} />

          <FormInput
            label="Preço *"
            type="number"
            step="0.01"
            min={0}
            error={errors.price?.message}
            {...register('price', { valueAsNumber: true })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Categoria *</label>
            <select
              className={selectClass(!!errors.categoryId)}
              {...register('categoryId')}
              disabled={loading || loadingOptions}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
            )}
          </div>

          <FormInput
            label="Quantidade em Estoque *"
            type="number"
            error={errors.quantity?.message}
            {...register('quantity', { valueAsNumber: true })}
          />

          <FormInput
            label="Quantidade Mínima *"
            type="number"
            error={errors.minQuantity?.message}
            {...register('minQuantity', { valueAsNumber: true })}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fabricante *</label>
            <select
              className={selectClass(!!errors.manufacturerId)}
              {...register('manufacturerId')}
              disabled={loading || loadingOptions}
            >
              <option value="">Selecione um fabricante</option>
              {manufacturers.map((man) => (
                <option key={man.id} value={man.id}>
                  {man.name}
                </option>
              ))}
            </select>
            {errors.manufacturerId && (
              <p className="text-red-500 text-sm mt-1">{errors.manufacturerId.message}</p>
            )}
          </div>

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
          <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
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
