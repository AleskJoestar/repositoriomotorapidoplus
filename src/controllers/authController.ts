import { Request, Response } from 'express';
import { login, refreshAccessToken } from '@/services/authService';
import { loginSchema, refreshTokenSchema } from '@/schemas/authSchema';
import { ZodError } from 'zod';

export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const result = await login(validatedData);
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      return;
    }
    if (error instanceof Error) {
      const statusCode = (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const refreshController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const validatedData = refreshTokenSchema.parse(req.body);
    const result = await refreshAccessToken(validatedData.refreshToken);
    if (!result) {
      res.status(401).json({ error: 'Refresh token inválido ou expirado' });
      return;
    }
    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
