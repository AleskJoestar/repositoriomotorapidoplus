import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  listCategoriesController,
  createCategoryController,
  updateCategoryController,
  inactivateCategoryController,
  reactivateCategoryController,
  exportCategoriesPdfController,
  exportCategoriesXmlController,
} from '@/controllers/categoryController';

const router = Router();
router.use(authenticateToken);

router.get('/categories', listCategoriesController);
router.get('/categories/report/pdf', exportCategoriesPdfController);
router.get('/categories/report/xml', exportCategoriesXmlController);
router.post('/categories', createCategoryController);
router.put('/categories/:id', updateCategoryController);
router.delete('/categories/:id', inactivateCategoryController);
router.patch('/categories/:id/reactivate', reactivateCategoryController);

export default router;
