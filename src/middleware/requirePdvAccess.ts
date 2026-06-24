import { PrismaClient } from '@prisma/client';
import { Request, Response, NextFunction } from 'express';

const prisma = new PrismaClient();

export const resolveUserAccessType = async (req: Request): Promise<string | undefined> => {
  if (req.accessType) return req.accessType;
  if (!req.userId) return undefined;

  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { accessType: true, status: true },
  });

  if (!user || user.status !== 'Ativo') return undefined;
  return user.accessType;
};

/** Permite Master e Comum ativos usarem o PDV (caixa) */
export const requirePdvAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ error: 'Autenticação necessária' });
    return;
  }

  const accessType = await resolveUserAccessType(req);
  if (!accessType) {
    res.status(401).json({ error: 'Usuário inválido ou inativo' });
    return;
  }

  if (accessType !== 'MASTER' && accessType !== 'COMUM') {
    res.status(403).json({ error: 'Acesso ao caixa não permitido para este perfil' });
    return;
  }

  req.accessType = accessType;
  next();
};
