import { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  getAllUsers,
  createUser,
  inactivateUser,
  reactivateUser,
  generateUsersPdf,
  generateUsersXml,
} from '@/services/userService';
import { createUserSchema } from '@/schemas/userSchema';

export const listUsersController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ error: error.message });
  }
};

export const createUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = createUserSchema.parse(req.body);
    const user = await createUser(data);
    res.status(201).json(user);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      return;
    }
    if (error instanceof Error) {
      const code = (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(code).json({ error: error.message });
    }
  }
};

export const inactivateUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await inactivateUser(id);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(code).json({ error: error.message });
    }
  }
};

export const reactivateUserController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const user = await reactivateUser(id);
    res.status(200).json(user);
  } catch (error) {
    if (error instanceof Error) {
      const code = (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(code).json({ error: error.message });
    }
  }
};

export const exportUsersPdfController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const pdf = await generateUsersPdf();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="usuarios-${Date.now()}.pdf"`
    );
    res.status(200).send(pdf);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ error: error.message });
  }
};

export const exportUsersXmlController = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const xml = await generateUsersXml();
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="usuarios-${Date.now()}.xml"`
    );
    res.status(200).send(xml);
  } catch (error) {
    if (error instanceof Error) res.status(500).json({ error: error.message });
  }
};
