import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { LoginRequest, TokenResponse } from '@/types';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'secret';
const JWT_EXPIRATION = process.env.JWT_EXPIRATION || '2h';
const REFRESH_TOKEN_EXPIRATION = process.env.REFRESH_TOKEN_EXPIRATION || '7d';

export const generateAccessToken = (
  userId: number,
  email: string,
  accessType: string
): string =>
  jwt.sign({ id: userId, email, accessType }, JWT_SECRET, {
    expiresIn: JWT_EXPIRATION,
  } as jwt.SignOptions);

export const generateRefreshToken = (
  userId: number,
  email: string,
  accessType: string
): string =>
  jwt.sign({ id: userId, email, accessType }, JWT_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRATION,
  } as jwt.SignOptions);

const buildUsuario = (user: {
  id: number;
  email: string;
  accessType: string;
  employee?: { name: string } | null;
}) => ({
  id: user.id,
  nome: user.employee?.name || user.email.split('@')[0],
  email: user.email,
  accessType: user.accessType,
});

export const login = async (data: LoginRequest): Promise<TokenResponse> => {
  const user = await prisma.user.findUnique({
    where: { email: data.email.trim().toLowerCase() },
    include: { employee: { select: { name: true } } },
  });

  if (!user || user.status !== 'Ativo') {
    const error = new Error('E-mail ou senha incorretos');
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(data.senha, user.password);
  if (!passwordMatch) {
    const error = new Error('E-mail ou senha incorretos');
    (error as Error & { statusCode?: number }).statusCode = 401;
    throw error;
  }

  return {
    accessToken: generateAccessToken(user.id, user.email, user.accessType),
    refreshToken: generateRefreshToken(user.id, user.email, user.accessType),
    usuario: buildUsuario(user),
  };
};

export const refreshAccessToken = async (
  refreshToken: string
): Promise<TokenResponse | null> => {
  try {
    const decoded = jwt.verify(refreshToken, JWT_SECRET) as {
      id: number;
      email: string;
      accessType: string;
    };

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { employee: { select: { name: true } } },
    });

    if (!user || user.status !== 'Ativo') return null;

    return {
      accessToken: generateAccessToken(user.id, user.email, user.accessType),
      refreshToken: generateRefreshToken(user.id, user.email, user.accessType),
      usuario: buildUsuario(user),
    };
  } catch {
    return null;
  }
};
