import { useAuth } from '@/context/AuthContext';

export const usePermissions = () => {
  const { user } = useAuth();
  const isMaster = user?.accessType === 'MASTER';

  return {
    isMaster,
    canInactivate: isMaster,
    canAccessAdminModules: isMaster,
    canAccessReports: isMaster,
    canManageParts: isMaster,
    canUsePdv: isMaster || user?.accessType === 'COMUM',
  };
};
