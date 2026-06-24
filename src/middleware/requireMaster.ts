import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const requireMaster = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  if (!req.userId) {
    res.status(401).json({ error: 'Autenticação necessária' });
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.userId } });

  if (!user || user.status !== 'Ativo' || user.accessType !== 'MASTER') {
    res.status(403).json({ error: 'Acesso restrito ao usuário Master' });
    return;
  }

  next();
};
