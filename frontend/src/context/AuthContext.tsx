import React, { createContext, useState, useCallback, useEffect } from 'react';
import { AuthContextType, User } from '@/types/auth';
import { authService } from '@/services/authService';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );

  // Carregar usuário do localStorage ao montar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser && accessToken) {
      setUser(JSON.parse(storedUser));
    }
  }, [accessToken]);

  const login = useCallback(async (email: string, senha: string) => {
    const response = await authService.login({ email, senha });
    setAccessToken(response.accessToken);
    setUser(response.usuario);
    localStorage.setItem('accessToken', response.accessToken);
    localStorage.setItem('refreshToken', response.refreshToken);
    localStorage.setItem('user', JSON.stringify(response.usuario));
  }, []);

  const register = useCallback(
    async (nome: string, email: string, senha: string, confirmarSenha: string) => {
      await authService.register({ nome, email, senha, confirmarSenha });
      // Após registrar, faz login automático (ou redireciona para login)
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isAuthenticated: !!user && !!accessToken,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
