import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/Button';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const isMaster = user?.accessType === 'MASTER';

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
      title: 'Caixa',
      description: 'Ponto de venda (PDV)',
      icon: '🛒',
      color: 'bg-orange-50 border-orange-200 hover:bg-orange-100',
      onClick: () => navigate('/sales'),
      enabled: true,
    },
    {
      title: 'Relatório de Vendas',
      description: 'Histórico e exportação de vendas',
      icon: '📊',
      color: 'bg-rose-50 border-rose-200 hover:bg-rose-100',
      onClick: () => navigate('/sales/report'),
      enabled: true,
    },
    {
      title: 'Estoque',
      description: 'Controle de produtos e inventário',
      icon: '📦',
      color: 'bg-green-50 border-green-200 hover:bg-green-100',
      onClick: () => navigate('/parts'),
      enabled: true,
    },
    {
      title: 'Departamentos',
      description: 'Departamentos e cargos',
      icon: '🏢',
      color: 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100',
      onClick: () => navigate('/departments'),
      enabled: true,
    },
    {
      title: 'Fabricantes',
      description: 'Cadastro de fabricantes',
      icon: '🏭',
      color: 'bg-amber-50 border-amber-200 hover:bg-amber-100',
      onClick: () => navigate('/manufacturers'),
      enabled: true,
    },
    {
      title: 'Categorias',
      description: 'Categorias de peças',
      icon: '🏷️',
      color: 'bg-teal-50 border-teal-200 hover:bg-teal-100',
      onClick: () => navigate('/categories'),
      enabled: true,
    },
    {
      title: 'Usuários',
      description: 'Gestão de acessos (Master)',
      icon: '🔐',
      color: 'bg-purple-50 border-purple-200 hover:bg-purple-100',
      onClick: () => navigate('/users'),
      enabled: isMaster,
      masterOnly: true,
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
              className={`p-6 rounded-lg border-2 transition-all text-left ${module.color} ${
                !module.enabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'
              }`}
            >
              <div className="text-4xl mb-3">{module.icon}</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">{module.title}</h3>
              <p className="text-gray-600 text-sm">{module.description}</p>
              {!module.enabled && module.masterOnly && (
                <span className="inline-block mt-4 text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  Apenas Master
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
              <p className="text-sm text-gray-600">Tipo de Acesso</p>
              <p className="text-gray-800 font-medium">
                {user?.accessType === 'MASTER' ? 'Master' : 'Comum'}
              </p>
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
