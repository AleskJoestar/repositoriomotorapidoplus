import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  createPartController,
  getAllPartsController,
  getPartByIdController,
  updatePartController,
  deletePartController,
  exportPartsPdfController,
  exportPartsXlsxController,
} from '@/controllers/partController';

const router = Router();

router.use(authenticateToken);

router.post('/parts', createPartController);
router.get('/parts', getAllPartsController);
router.get('/parts/report/pdf', exportPartsPdfController);
router.get('/parts/report/xlsx', exportPartsXlsxController);
router.get('/parts/:id', getPartByIdController);
router.put('/parts/:id', updatePartController);
router.delete('/parts/:id', deletePartController);

export default router;
