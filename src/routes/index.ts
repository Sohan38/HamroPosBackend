import { Router } from 'express';
import licenseRoutes from './license.routes';
import subscriptionRoutes from './subscription.routes';
import organizationRoutes from './organization.routes';
import adminRoutes from './admin.routes';
import billingRoutes from './billing.routes';
import invoiceRoutes from './invoice.routes';

const router = Router();

router.use('/license', licenseRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/organization', organizationRoutes);
router.use('/admin', adminRoutes);
router.use('/webhooks', billingRoutes);
router.use('/invoice', invoiceRoutes);

export default router;
