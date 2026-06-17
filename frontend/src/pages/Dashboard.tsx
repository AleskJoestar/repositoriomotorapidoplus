import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">MotoRapido PLUS</h1>
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/employees')}
              className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              Funcionários
            </button>
            <Button variant="secondary" onClick={handleLogout}>
              Sair
            </Button>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">Bem-vindo, {user?.nome}!</h2>
          <p className="text-gray-600">E-mail: {user?.email}</p>
          <p className="text-gray-600 mt-2">ID: {user?.id}</p>
        </div>
      </main>
    </div>
  );
};
