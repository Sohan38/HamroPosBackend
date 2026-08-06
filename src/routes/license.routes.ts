import { Router } from 'express';
import { activationRateLimiter } from '../middleware/rateLimit.middleware';
import { requireJson } from '../middleware/security.middleware';
import { requireSigningEnabled } from '../middleware/secretGuard.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { licenseActivationSchema } from '../validators/license.validator';
import { licenseVerifySchema } from '../validators/license.validator';
import { licenseResetSchema } from '../validators/license.validator';
import { LicenseController } from '../controllers/license.controller';

const router = Router();
const controller = new LicenseController();

router.post('/activate', requireJson, activationRateLimiter, requireSigningEnabled, validateRequest(licenseActivationSchema), controller.activate);
router.post('/verify', requireJson, validateRequest(licenseVerifySchema), controller.verify);
router.post('/devices/reset', requireJson, validateRequest(licenseResetSchema), controller.resetDevices);
router.get('/public-keys', controller.getPublicKeys.bind(controller));

export default router;
