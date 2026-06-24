import React, { useState } from 'react';
import { FormInput } from './FormInput';
import { Button } from './Button';

interface MasterAuthModalProps {
  open: boolean;
  loading?: boolean;
  onConfirm: (email: string, senha: string) => Promise<void>;
  onCancel: () => void;
}

export const MasterAuthModal: React.FC<MasterAuthModalProps> = ({
  open,
  loading = false,
  onConfirm,
  onCancel,
}) => {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(email, senha);
    setEmail('');
    setSenha('');
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
        <h2 className="text-lg font-bold text-gray-900 mb-2">Autorização Master</h2>
        <p className="text-gray-600 text-sm mb-4">
          Informe as credenciais de um usuário Master para remover o item do carrinho.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormInput
            label="E-mail Master"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <FormInput
            label="Senha Master"
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
          <div className="flex gap-3 justify-end">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" variant="danger" loading={loading}>
              Confirmar Remoção
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
