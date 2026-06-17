export interface User {
  id: number;
  nome: string;
  email: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  usuario: User;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, confirmarSenha: string) => Promise<void>;
  logout: () => void;
}
