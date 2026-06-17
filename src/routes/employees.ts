import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  createEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
  deleteEmployeeController,
} from '@/controllers/employeeController';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticateToken);

/**
 * POST /api/employees
 * RF03 - Cadastrar novo funcionário
 */
router.post('/employees', createEmployeeController);

/**
 * GET /api/employees
 * Listar todos os funcionários com filtros opcionais
 */
router.get('/employees', getAllEmployeesController);

/**
 * GET /api/employees/:id
 * Buscar funcionário por ID
 */
router.get('/employees/:id', getEmployeeByIdController);

/**
 * PUT /api/employees/:id
 * RF04 - Editar funcionário
 */
router.put('/employees/:id', updateEmployeeController);

/**
 * DELETE /api/employees/:id
 * RF05 - Inativar funcionário (exclusão lógica)
 */
router.delete('/employees/:id', deleteEmployeeController);

export default router;
