import { Request, Response } from 'express';
import { ZodError } from 'zod';
import {
  getAllDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  inactivateDepartment,
  reactivateDepartment,
  getPositionsByDepartment,
} from '@/services/departmentService';
import {
  createDepartmentSchema,
  updateDepartmentSchema,
} from '@/schemas/departmentSchema';

export const listDepartmentsController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const departments = await getAllDepartments(includeInactive);
    res.status(200).json(departments);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const getDepartmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const dept = await getDepartmentById(id);
    if (!dept) {
      res.status(404).json({ error: 'Departamento não encontrado' });
      return;
    }
    res.status(200).json(dept);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const createDepartmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = createDepartmentSchema.parse(req.body);
    const dept = await createDepartment(data);
    res.status(201).json(dept);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      return;
    }
    if (error instanceof Error) {
      const statusCode =
        (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const updateDepartmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const data = updateDepartmentSchema.parse(req.body);
    const dept = await updateDepartment(id, data);
    res.status(200).json(dept);
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ error: 'Dados inválidos', details: error.errors });
      return;
    }
    if (error instanceof Error) {
      const statusCode =
        (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const inactivateDepartmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const dept = await inactivateDepartment(id);
    res.status(200).json(dept);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode =
        (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const reactivateDepartmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const id = parseInt(req.params.id, 10);
    const dept = await reactivateDepartment(id);
    res.status(200).json(dept);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode =
        (error as Error & { statusCode?: number }).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

export const listPositionsByDepartmentController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const departmentId = parseInt(req.params.departmentId, 10);
    const positions = await getPositionsByDepartment(departmentId);
    res.status(200).json(positions);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
