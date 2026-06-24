export type AccessType = 'MASTER' | 'COMUM';

export interface User {
  id: number;
  nome: string;
  email: string;
  accessType: AccessType;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: User;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<User>;
  logout: () => void;
}
