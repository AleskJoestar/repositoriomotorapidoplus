import { Router } from 'express';
import { authenticateToken } from '@/middleware/auth';
import { requireMaster } from '@/middleware/requireMaster';
import { requirePdvAccess } from '@/middleware/requirePdvAccess';
import {
  getCurrentSaleController,
  addCartItemController,
  removeCartItemController,
  checkoutSaleController,
  getSalesReportController,
  exportSalesPdfController,
  exportSalesXmlController,
} from '@/controllers/saleController';

const router = Router();

router.use(authenticateToken);

router.get('/sales/current', requirePdvAccess, getCurrentSaleController);
router.get('/sales/report', requireMaster, getSalesReportController);
router.get('/sales/report/pdf', requireMaster, exportSalesPdfController);
router.get('/sales/report/xml', requireMaster, exportSalesXmlController);
router.post('/sales/items', requirePdvAccess, addCartItemController);
router.delete('/sales/items/:partId', requirePdvAccess, removeCartItemController);
router.post('/sales/checkout', requirePdvAccess, checkoutSaleController);

export default router;
