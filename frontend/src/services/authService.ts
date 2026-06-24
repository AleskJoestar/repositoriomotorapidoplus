import api from './api';
import { LoginRequest, LoginResponse } from '@/types/auth';

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  refresh: async (refreshToken: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },
};
