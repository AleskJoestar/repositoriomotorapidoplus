import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { requireMaster } from '@/middleware/requireMaster';
import {
  createPartController,
  getAllPartsController,
  getPartByIdController,
  updatePartController,
  deletePartController,
  reactivatePartController,
  getPartAuditLogsController,
  exportPartsPdfController,
  exportPartsXlsxController,
} from '@/controllers/partController';

const router = Router();

router.use(authenticateToken);

router.post('/parts', createPartController);
router.get('/parts', getAllPartsController);
router.get('/parts/report/pdf', requireMaster, exportPartsPdfController);
router.get('/parts/report/xlsx', requireMaster, exportPartsXlsxController);
router.get('/parts/:id/audit-logs', getPartAuditLogsController);
router.get('/parts/:id', getPartByIdController);
router.put('/parts/:id', updatePartController);
router.delete('/parts/:id', deletePartController);
router.patch('/parts/:id/reactivate', reactivatePartController);

export default router;
