import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { requireMaster } from '@/middleware/requireMaster';
import {
  listUsersController,
  getUserByIdController,
  createUserController,
  updateUserController,
  inactivateUserController,
  reactivateUserController,
  exportUsersPdfController,
  exportUsersXmlController,
} from '@/controllers/userController';

const router = Router();

router.use(authenticateToken);

router.get('/users', requireMaster, listUsersController);
router.get('/users/report/pdf', requireMaster, exportUsersPdfController);
router.get('/users/report/xml', requireMaster, exportUsersXmlController);
router.post('/users', requireMaster, createUserController);
router.get('/users/:id', requireMaster, getUserByIdController);
router.put('/users/:id', requireMaster, updateUserController);
router.delete('/users/:id', requireMaster, inactivateUserController);
router.patch('/users/:id/reactivate', requireMaster, reactivateUserController);

export default router;
