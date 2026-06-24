import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/pages/ProtectedRoute';

interface PdvRouteProps {
  children: React.ReactNode;
}

/** Estoque e Caixa — usuários Master e Comum */
export const PdvRoute: React.FC<PdvRouteProps> = ({ children }) => {
  const { user } = useAuth();
  const canUsePdv =
    user?.accessType === 'MASTER' || user?.accessType === 'COMUM';

  return (
    <ProtectedRoute>
      {canUsePdv ? children : <Navigate to="/login" replace />}
    </ProtectedRoute>
  );
};
