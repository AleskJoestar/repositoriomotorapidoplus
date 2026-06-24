import React from 'react';
import { PartAuditLogEntry } from '@/types/part';

interface PartAuditLogProps {
  logs: PartAuditLogEntry[];
  loading?: boolean;
}

const actionLabels: Record<PartAuditLogEntry['action'], string> = {
  CREATE: 'Cadastro',
  UPDATE: 'Alteração',
  DELETE: 'Exclusão / Inativação',
};

const formatDateTime = (dateStr: string): string =>
  new Date(dateStr).toLocaleString('pt-BR');

const formatChangedFields = (
  fields: Record<string, unknown>
): string => {
  return Object.entries(fields)
    .map(([key, value]) => `${key}: ${String(value ?? '-')}`)
    .join(' | ');
};

export const PartAuditLog: React.FC<PartAuditLogProps> = ({ logs, loading }) => {
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Auditoria</h2>
        <div className="flex justify-center py-8">
          <div className="h-8 w-8 border-4 border-green-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Histórico de Auditoria</h2>
        <p className="text-sm text-gray-500">Nenhuma alteração registrada.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Histórico de Auditoria</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Data/Hora</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Usuário</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Ação</th>
              <th className="px-4 py-2 text-left font-medium text-gray-700">Alterações</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 whitespace-nowrap">
                  {formatDateTime(log.createdAt)}
                </td>
                <td className="px-4 py-3 text-gray-900">{log.userName}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {actionLabels[log.action]}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-600 text-xs">
                  {formatChangedFields(log.changedFields)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
