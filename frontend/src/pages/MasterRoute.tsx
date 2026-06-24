import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/pages/ProtectedRoute';

interface MasterRouteProps {
  children: React.ReactNode;
}

export const MasterRoute: React.FC<MasterRouteProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.accessType === 'MASTER' ? children : <Navigate to="/sales" replace />}
    </ProtectedRoute>
  );
};
