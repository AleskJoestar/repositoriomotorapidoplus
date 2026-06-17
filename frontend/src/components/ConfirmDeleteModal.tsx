import React from 'react';
import { Button } from './Button';

interface ConfirmDeleteModalProps {
  employeeName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  employeeName,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
      onCancel();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-lg shadow-lg p-6 w-96 max-w-full"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          Confirmar Exclusão
        </h2>

        <p className="text-gray-600 mb-6">
          Deseja realmente inativar o funcionário <strong>{employeeName}</strong>?
        </p>

        <div className="flex gap-3 justify-end">
          <Button
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading || loading}
          >
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleConfirm}
            loading={isLoading || loading}
          >
            Inativar
          </Button>
        </div>
      </div>
    </div>
  );
};
