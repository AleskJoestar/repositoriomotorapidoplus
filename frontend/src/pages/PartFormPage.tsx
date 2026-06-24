import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useParts } from '@/hooks/useParts';
import { PartForm } from '@/components/PartForm';
import { PartAuditLog } from '@/components/PartAuditLog';
import { Toast } from '@/components/Toast';
import { CreatePartRequest, UpdatePartRequest, Part, PartAuditLogEntry } from '@/types/part';
import { partService } from '@/services/partService';

export const PartFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const { fetchPartById, createPart, updatePart } = useParts();
  const [part, setPart] = useState<Part | null>(null);
  const [auditLogs, setAuditLogs] = useState<PartAuditLogEntry[]>([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [loading, setLoading] = useState(!!id);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const isEditing = !!id;
  const pageTitle = isEditing ? 'Editar Produto' : 'Novo Produto';

  useEffect(() => {
    if (isEditing) {
      const loadPart = async () => {
        setLoading(true);
        try {
          const data = await fetchPartById(id!);
          if (data) {
            setPart(data);
            setAuditLoading(true);
            try {
              const logs = await partService.getAuditLogs(id!);
              setAuditLogs(logs);
            } catch {
              setAuditLogs([]);
            } finally {
              setAuditLoading(false);
            }
          } else {
            setToast({ message: 'Peça não encontrada', type: 'error' });
            setTimeout(() => navigate('/parts'), 2000);
          }
        } catch {
          setToast({ message: 'Erro ao carregar peça', type: 'error' });
          setTimeout(() => navigate('/parts'), 2000);
        } finally {
          setLoading(false);
        }
      };

      loadPart();
    }
  }, [id, isEditing, fetchPartById, navigate]);

  const handleSubmit = async (data: CreatePartRequest | UpdatePartRequest) => {
    setSubmitting(true);
    try {
      if (isEditing && id) {
        await updatePart(id, data as UpdatePartRequest);
        setToast({ message: 'Peça atualizada com sucesso!', type: 'success' });
      } else {
        await createPart(data as CreatePartRequest);
        setToast({ message: 'Peça criada com sucesso!', type: 'success' });
      }
      setTimeout(() => navigate('/parts'), 1500);
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error || 'Erro ao salvar peça',
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
          <div className="h-12 w-12 border-4 border-green-600 border-t-transparent rounded-full"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => navigate('/parts')}
            className="text-green-600 hover:text-green-800 font-medium mb-4"
          >
            ← Voltar para Produtos
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
        </div>

        <PartForm
          part={part || undefined}
          onSubmit={handleSubmit}
          loading={submitting}
          onCancel={() => navigate('/parts')}
          onValidationError={(message) => setToast({ message, type: 'error' })}
        />

        {isEditing && (
          <PartAuditLog logs={auditLogs} loading={auditLoading} />
        )}

        {toast && (
          <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
        )}
      </div>
    </div>
  );
};
