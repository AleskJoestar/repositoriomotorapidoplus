import api from './api';
import { RegisterRequest, LoginRequest, LoginResponse } from '@/types/auth';

export const authService = {
  register: async (data: RegisterRequest) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};
