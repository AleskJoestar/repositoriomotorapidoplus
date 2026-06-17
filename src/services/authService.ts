import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { RegisterRequest, LoginRequest, TokenResponse } from '@/types';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '2h';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

/**
 * Gera um access token JWT
 */
export const generateAccessToken = (userId: number, email: string): string => {
  return jwt.sign(
    { id: userId, email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRATION } as any
  );
};

/**
 * Gera um refresh token JWT
 */
export const generateRefreshToken = (userId: number, email: string): string => {
  return jwt.sign(
    { id: userId, email },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRATION } as any
  );
};

/**
 * RF01 - Registrar novo usuário
 */
export const register = async (
  data: RegisterRequest
): Promise<{ id: number; nome: string; email: string; data_cadastro: string }> => {
  // Verificar se email já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) {
    const error = new Error('E-mail já cadastrado');
    (error as any).statusCode = 409;
    throw error;
  }

  // Hash da senha com bcrypt (10 rounds)
  const hashedPassword = await bcrypt.hash(data.senha, 10);

  // Criar usuário
  const user = await prisma.user.create({
    data: {
      name: data.nome,
      email: data.email,
      password: hashedPassword,
      status: 'ativo',
    },
  });

  return {
    id: user.id,
    nome: user.name,
    email: user.email,
    data_cadastro: user.createdAt.toISOString(),
  };
};

/**
 * RF02 - Login (autenticar usuário)
 */
export const login = async (
  data: LoginRequest
): Promise<TokenResponse> => {
  // Buscar usuário por email
  const user = await prisma.user.findUnique({
    where: { email: data.email },
  });

  // Se não encontrou ou status inativo, retornar erro genérico (anti-enumeração)
  if (!user || user.status !== 'ativo') {
    const error = new Error('E-mail ou senha incorretos');
    (error as any).statusCode = 401;
    throw error;
  }

  // Verificar senha com bcrypt
  const passwordMatch = await bcrypt.compare(data.senha, user.password);

  if (!passwordMatch) {
    const error = new Error('E-mail ou senha incorretos');
    (error as any).statusCode = 401;
    throw error;
  }

  // Gerar tokens
  const accessToken = generateAccessToken(user.id, user.email);
  const refreshToken = generateRefreshToken(user.id, user.email);

  return {
    accessToken,
    refreshToken,
    usuario: {
      id: user.id,
      nome: user.name,
      email: user.email,
    },
  };
};

/**
 * Refresh Token - Renovar access token a partir do refresh token
 */
export const refreshAccessToken = async (
  refreshToken: string
): Promise<TokenResponse | null> => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
      id: number;
      email: string;
    };

    // Buscar usuário para verificar status
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!user || user.status !== 'ativo') {
      return null;
    }

    // Gerar novo access token e novo refresh token
    const newAccessToken = generateAccessToken(user.id, user.email);
    const newRefreshToken = generateRefreshToken(user.id, user.email);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      usuario: {
        id: user.id,
        nome: user.name,
        email: user.email,
      },
    };
  } catch {
    return null;
  }
};
