import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  createEmployeeController,
  getAllEmployeesController,
  getEmployeeByIdController,
  updateEmployeeController,
  deleteEmployeeController,
  reactivateEmployeeController,
  exportEmployeesPdfController,
  exportEmployeesXlsxController,
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
 * GET /api/employees/report/pdf
 * RF06 - Relatório de funcionários em PDF
 */
router.get('/employees/report/pdf', exportEmployeesPdfController);

/**
 * GET /api/employees/report/xlsx
 * RF06 - Relatório de funcionários em XLSX
 */
router.get('/employees/report/xlsx', exportEmployeesXlsxController);

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
router.patch('/employees/:id/reactivate', reactivateEmployeeController);

export default router;
