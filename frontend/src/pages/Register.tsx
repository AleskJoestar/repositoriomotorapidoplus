import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema } from '@/schemas/authSchema';
import { useAuth } from '@/context/AuthContext';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { AuthLayout } from '@/components/AuthLayout';
import { Toast } from '@/components/Toast';

interface RegisterFormData {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register: registerUser } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    try {
      await registerUser(data.nome, data.email, data.senha, data.confirmarSenha);
      setToast({ message: 'Usuário registrado com sucesso! Redirecionando...', type: 'success' });
      reset();
      setTimeout(() => navigate('/login'), 2000);
    } catch (error: any) {
      setToast({
        message: error.response?.data?.error || 'Erro ao registrar. Tente novamente.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Cadastro" subtitle="Crie sua conta no MotoRapido PLUS">
      <form onSubmit={handleSubmit(onSubmit)}>
        <FormInput
          label="Nome Completo"
          placeholder="João Silva"
          error={errors.nome?.message}
          {...register('nome')}
        />
        <FormInput
          label="E-mail"
          type="email"
          placeholder="seu@email.com"
          error={errors.email?.message}
          {...register('email')}
        />
        <FormInput
          label="Senha"
          type="password"
          placeholder="Mínimo 6 caracteres"
          error={errors.senha?.message}
          {...register('senha')}
        />
        <FormInput
          label="Confirmar Senha"
          type="password"
          placeholder="Repita sua senha"
          error={errors.confirmarSenha?.message}
          {...register('confirmarSenha')}
        />
        <Button type="submit" loading={loading} className="w-full mb-4">
          Cadastrar
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="w-full"
          onClick={() => navigate('/login')}
        >
          Já tem conta? Faça login
        </Button>
      </form>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </AuthLayout>
  );
};
