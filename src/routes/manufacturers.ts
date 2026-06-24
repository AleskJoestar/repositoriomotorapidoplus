import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import {
  listManufacturersController,
  createManufacturerController,
  updateManufacturerController,
  inactivateManufacturerController,
  reactivateManufacturerController,
  exportManufacturersPdfController,
  exportManufacturersXmlController,
} from '@/controllers/manufacturerController';

const router = Router();
router.use(authenticateToken);

router.get('/manufacturers', listManufacturersController);
router.get('/manufacturers/report/pdf', exportManufacturersPdfController);
router.get('/manufacturers/report/xml', exportManufacturersXmlController);
router.post('/manufacturers', createManufacturerController);
router.put('/manufacturers/:id', updateManufacturerController);
router.delete('/manufacturers/:id', inactivateManufacturerController);
router.patch('/manufacturers/:id/reactivate', reactivateManufacturerController);

export default router;
