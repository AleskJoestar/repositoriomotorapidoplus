import React, { createContext, useState, useCallback } from 'react';

import { AuthContextType, User } from '@/types/auth';

import { authService } from '@/services/authService';



export const AuthContext = createContext<AuthContextType | undefined>(undefined);



const loadStoredSession = (): { user: User | null; token: string | null } => {

  const token = localStorage.getItem('accessToken');

  const storedUser = localStorage.getItem('user');



  if (!token || !storedUser) {

    return { user: null, token: null };

  }



  try {

    return { user: JSON.parse(storedUser) as User, token };

  } catch {

    return { user: null, token: null };

  }

};



export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const storedSession = loadStoredSession();

  const [user, setUser] = useState<User | null>(storedSession.user);

  const [accessToken, setAccessToken] = useState<string | null>(storedSession.token);



  const login = useCallback(async (email: string, senha: string): Promise<User> => {

    const response = await authService.login({ email, senha });

    setAccessToken(response.accessToken);

    setUser(response.usuario);

    localStorage.setItem('accessToken', response.accessToken);

    localStorage.setItem('refreshToken', response.refreshToken);

    localStorage.setItem('user', JSON.stringify(response.usuario));

    return response.usuario;

  }, []);



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


