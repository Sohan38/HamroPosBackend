import { Router } from 'express';
import { InvoiceController } from '../controllers/invoice.controller';
import { jwtAuth } from '../middleware/jwtAuth.middleware';

const router = Router();
const controller = new InvoiceController();

// Admin-only invoice endpoints
router.use(jwtAuth(['admin', 'superadmin']));

router.get('/:id', controller.getInvoice.bind(controller));
router.get('/subscription/:subscriptionId', controller.listBySubscription.bind(controller));

export default router;
