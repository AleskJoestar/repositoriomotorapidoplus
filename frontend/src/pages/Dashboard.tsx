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

  const modules = [
    {
      title: 'Funcionários',
      description: 'Gerencie seus funcionários',
      icon: '👥',
      color: 'bg-blue-50 border-blue-200 hover:bg-blue-100',
      onClick: () => navigate('/employees'),
      enabled: true,
    },
    {
      title: 'Usuários',
      description: 'Gerencie acesso e permissões',
      icon: '🔐',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      onClick: () => {},
      enabled: false,
    },
    {
      title: 'Estoque',
      description: 'Controle de peças e inventário',
      icon: '📦',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      onClick: () => navigate('/parts'),
      enabled: true,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800">MotoRapido PLUS</h1>
          <Button variant="secondary" onClick={handleLogout}>
            Sair
          </Button>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Bem-vindo, {user?.nome}!</h2>
          <p className="text-gray-600">Escolha um módulo abaixo para gerenciar seu sistema</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module) => (
            <button
              key={module.title}
              onClick={module.onClick}
              disabled={!module.enabled}
              className={`p-6 rounded-lg border-2 transition-all ${module.color} ${
                !module.enabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
              }`}
            >
              <div className="text-4xl mb-3">{module.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{module.title}</h3>
              <p className="text-gray-600 text-sm">{module.description}</p>
              {!module.enabled && (
                <span className="inline-block mt-4 text-xs bg-gray-300 text-gray-700 px-2 py-1 rounded">
                  Em breve
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Informações da Conta</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Nome</p>
              <p className="text-gray-800 font-medium">{user?.nome}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">E-mail</p>
              <p className="text-gray-800 font-medium">{user?.email}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">ID</p>
              <p className="text-gray-800 font-medium">{user?.id}</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
