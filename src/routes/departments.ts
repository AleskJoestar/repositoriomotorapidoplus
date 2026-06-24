import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  listDepartmentsController,
  getDepartmentController,
  createDepartmentController,
  updateDepartmentController,
  inactivateDepartmentController,
  reactivateDepartmentController,
  listPositionsByDepartmentController,
} from '@/controllers/departmentController';

const router = Router();
router.use(authenticateToken);

router.get('/departments', listDepartmentsController);
router.get('/departments/:departmentId/positions', listPositionsByDepartmentController);
router.get('/departments/:id', getDepartmentController);
router.post('/departments', createDepartmentController);
router.put('/departments/:id', updateDepartmentController);
router.delete('/departments/:id', inactivateDepartmentController);
router.patch('/departments/:id/reactivate', reactivateDepartmentController);

export default router;
