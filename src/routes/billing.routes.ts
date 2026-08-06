import { Router } from 'express';
import { requireJson } from '../middleware/security.middleware';
import { BillingController } from '../controllers/billing.controller';

const router = Router();
const controller = new BillingController();

router.post('/billing', requireJson, controller.handleWebhook.bind(controller));

export default router;
