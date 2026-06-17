import { Router } from 'express';
import {
  registerController,
  loginController,
  refreshController,
} from '@/controllers/authController';

const router = Router();

/**
 * POST /api/auth/register
 * RF01 - Cadastrar novo usuário
 */
router.post('/register', registerController);

/**
 * POST /api/auth/login
 * RF02 - Autenticar usuário
 */
router.post('/login', loginController);

/**
 * POST /api/auth/refresh
 * Renovar access token usando refresh token
 */
router.post('/refresh', refreshController);

export default router;
