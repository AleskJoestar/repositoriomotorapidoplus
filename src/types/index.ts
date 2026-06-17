export interface AuthPayload {
  id: number;
  email: string;
  iat?: number;
  exp?: number;
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

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  usuario: {
    id: number;
    nome: string;
    email: string;
  };
}
