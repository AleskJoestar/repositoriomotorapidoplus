import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/schemas/authSchema';
import { useAuth } from '@/context/AuthContext';
import { FormInput } from '@/components/FormInput';
import { Button } from '@/components/Button';
import { AuthLayout } from '@/components/AuthLayout';
import { Toast } from '@/components/Toast';

interface LoginFormData {
  email: string;
  senha: string;
}

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [loading, setLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const user = await login(data.email, data.senha);
      setToast({ message: 'Login bem-sucedido! Redirecionando...', type: 'success' });
      reset();
      const target = user.accessType === 'MASTER' ? '/dashboard' : '/sales';
      setTimeout(() => navigate(target), 800);
    } catch {
      setToast({
        message: 'E-mail ou senha incorretos',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Login" subtitle="Acesse o MotoRapido PLUS">
      <form onSubmit={handleSubmit(onSubmit)}>
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
          placeholder="Sua senha"
          error={errors.senha?.message}
          {...register('senha')}
        />
        <Button type="submit" loading={loading} className="w-full">
          Entrar
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
