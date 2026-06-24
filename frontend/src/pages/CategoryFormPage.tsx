import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useCategories } from '@/hooks/useCategories';
import { categoryService } from '@/services/categoryService';
import { Toast } from '@/components/Toast';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import {
  createCategorySchema,
  updateCategorySchema,
  CreateCategoryFormData,
} from '@/schemas/categorySchema';
import { Category, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category';

export const CategoryFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { createCategory, updateCategory } = useCategories();
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isEditing = !!id;
  const pageTitle = isEditing ? 'Editar Categoria' : 'Nova Categoria';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(isEditing ? updateCategorySchema : createCategorySchema),
  });

  useEffect(() => {
    if (isEditing) {
      const load = async () => {
        setLoading(true);
        try {
          const all = await categoryService.getAll(true);
          const found = all.find((c) => c.id === Number(id));
          if (found) {
            setCategory(found);
            reset({ name: found.name });
          } else {
            setToast({ message: 'Categoria não encontrada', type: 'error' });
            setTimeout(() => navigate('/categories'), 2000);
          }
        } catch {
          setToast({ message: 'Erro ao carregar categoria', type: 'error' });
          setTimeout(() => navigate('/categories'), 2000);
        } finally {
          setLoading(false);
        }
      };
      load();
    }
  }, [id, isEditing, navigate, reset]);

  const onSubmit = async (data: CreateCategoryFormData) => {
    setSubmitting(true);
    try {
      if (isEditing && id) {
        await updateCategory(id, data as UpdateCategoryRequest);
        setToast({ message: 'Categoria atualizada com sucesso!', type: 'success' });
      } else {
        await createCategory(data as CreateCategoryRequest);
        setToast({ message: 'Categoria criada com sucesso!', type: 'success' });
      }
      setTimeout(() => navigate('/categories'), 1500);
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error || 'Erro ao salvar categoria',
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/categories')}
            className="text-teal-600 hover:text-teal-800 font-medium mb-4"
          >
            ← Voltar para Categorias
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {isEditing && category && (
              <FormInput label="ID" value={category.id} disabled onChange={() => {}} />
            )}

            <FormInput
              label="Nome *"
              error={errors.name?.message}
              {...register('name')}
              disabled={submitting}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button type="button" variant="secondary" onClick={() => navigate('/categories')}>
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
