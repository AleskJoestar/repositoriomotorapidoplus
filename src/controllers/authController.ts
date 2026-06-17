import { Request, Response } from 'express';
import { register, login, refreshAccessToken } from '@/services/authService';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from '@/schemas/authSchema';
import { ZodError } from 'zod';

/**
 * POST /api/auth/register (RF01)
 */
export const registerController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validar schema
    const validatedData = registerSchema.parse(req.body);

    // Registrar usuário
    const user = await register(validatedData);

    res.status(201).json({
      message: 'Usuário registrado com sucesso',
      usuario: user,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
      return;
    }

    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * POST /api/auth/login (RF02)
 */
export const loginController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validar schema
    const validatedData = loginSchema.parse(req.body);

    // Login
    const result = await login(validatedData);

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
      return;
    }

    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * POST /api/auth/refresh
 */
export const refreshController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validar schema
    const validatedData = refreshTokenSchema.parse(req.body);

    // Renovar token
    const result = await refreshAccessToken(validatedData.refreshToken);

    if (!result) {
      res.status(401).json({ error: 'Refresh token inválido ou expirado' });
      return;
    }

    res.status(200).json(result);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        error: 'Dados inválidos',
        details: error.errors,
      });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
