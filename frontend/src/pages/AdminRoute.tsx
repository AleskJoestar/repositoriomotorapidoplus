import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { ProtectedRoute } from '@/pages/ProtectedRoute';

interface AdminRouteProps {
  children: React.ReactNode;
}

export const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      {user?.accessType === 'MASTER' ? children : <Navigate to="/sales" replace />}
    </ProtectedRoute>
  );
};
