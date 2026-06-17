import { Request, Response } from 'express';
import {
  createEmployee,
  getAllEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
  getAuditLogs,
} from '@/services/employeeService';
import {
  createEmployeeSchema,
  updateEmployeeSchema,
} from '@/schemas/employeeSchema';
import { ZodError } from 'zod';

/**
 * POST /api/employees (RF03 - Cadastro de funcionário)
 */
export const createEmployeeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validar autenticação
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    // Validar schema
    const validatedData = createEmployeeSchema.parse(req.body);

    // Criar funcionário
    const employee = await createEmployee(validatedData, String(req.userId));

    res.status(201).json(employee);
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
      const message =
        statusCode === 409
          ? 'Conflito: CPF ou E-mail já cadastrado'
          : error.message;
      res.status(statusCode).json({ error: message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * GET /api/employees (Listagem de funcionários)
 */
export const getAllEmployeesController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validar autenticação
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    // Extrair filtros
    const filters = {
      cargo: req.query.cargo as string | undefined,
      department: req.query.department as string | undefined,
      status: req.query.status as string | undefined,
    };

    // Buscar funcionários
    const employees = await getAllEmployees(filters);

    res.status(200).json(employees);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * GET /api/employees/:id (Detalhe de funcionário)
 */
export const getEmployeeByIdController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validar autenticação
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const { id } = req.params;

    // Validar ID
    if (!id || id.trim() === '') {
      res.status(400).json({ error: 'ID de funcionário inválido' });
      return;
    }

    // Buscar funcionário
    const employee = await getEmployeeById(id);

    if (!employee) {
      res.status(404).json({ error: 'Funcionário não encontrado' });
      return;
    }

    // Buscar logs de auditoria
    const auditLogs = await getAuditLogs(id);

    res.status(200).json(employee);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * PUT /api/employees/:id (RF04 - Edição de funcionário)
 */
export const updateEmployeeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validar autenticação
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const { id } = req.params;

    // Validar ID
    if (!id || id.trim() === '') {
      res.status(400).json({ error: 'ID de funcionário inválido' });
      return;
    }

    // Validar schema
    const validatedData = updateEmployeeSchema.parse(req.body);

    // Atualizar funcionário
    const employee = await updateEmployee(id, validatedData, String(req.userId));

    res.status(200).json(employee);
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
      const message =
        statusCode === 409
          ? 'Conflito: CPF ou E-mail já cadastrado'
          : error.message;
      res.status(statusCode).json({ error: message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

/**
 * DELETE /api/employees/:id (RF05 - Exclusão lógica de funcionário)
 */
export const deleteEmployeeController = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    // Validar autenticação
    if (!req.userId) {
      res.status(401).json({ error: 'Autenticação necessária' });
      return;
    }

    const { id } = req.params;

    // Validar ID
    if (!id || id.trim() === '') {
      res.status(400).json({ error: 'ID de funcionário inválido' });
      return;
    }

    // Deletar funcionário (exclusão lógica)
    const employee = await deleteEmployee(id, String(req.userId));

    res.status(200).json(employee);
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      res.status(statusCode).json({ error: error.message });
      return;
    }

    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};
