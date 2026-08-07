import { Router } from 'express';

const router = Router();

import { requireJson } from '../middleware/security.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { AdminController } from '../controllers/admin.controller';
import { adminAuth } from '../middleware/adminAuth.middleware';
import { authRateLimiter } from '../middleware/rateLimit.middleware';
import { setupGuard } from '../middleware/setupGuard.middleware';
import {
    createFeatureSchema,
    updateFeatureSchema,
    featureIdParamSchema,
    planIdParamSchema,
    planEntitlementsSchema,
    licenseIdParamSchema,
    licenseEntitlementsSchema,
    createLicenseSchema,
    createTokenSchema,
    setupAdminSchema,
    adminCreateSchema,
    adminUpdateSchema,
    adminListSchema,
    adminAuditQuerySchema,
} from '../validators/admin.validator';
import { PlanController } from '../controllers/plan.controller';
import { LicenseAdminController } from '../controllers/adminLicense.controller';
import { SubscriptionController } from '../controllers/subscription.controller';
import { OrganizationController } from '../controllers/organization.controller';
import { DeviceController } from '../controllers/device.controller';

const controller = new AdminController();
const planController = new PlanController();
const licenseAdminController = new LicenseAdminController();
const subscriptionController = new SubscriptionController();
const organizationController = new OrganizationController();
const deviceController = new DeviceController();

// Token issuance: bootstrap using admin API key
router.post('/token', requireJson, authRateLimiter, validateRequest(createTokenSchema), controller.issueToken.bind(controller));

// One-time setup endpoint to create initial admin; protected by adminApiKey env.
// The route is only enabled when ENABLE_ADMIN_BOOTSTRAP=true and when no admin exists.
router.post('/setup', setupGuard, adminAuth, requireJson, validateRequest(setupAdminSchema), controller.setupAdmin.bind(controller));

// Protect admin endpoints with role-based JWT
import { jwtAuth } from '../middleware/jwtAuth.middleware';
import { requireJwtSecret } from '../middleware/secretGuard.middleware';

// Ensure JWT secret present before enabling protected admin routes
router.use(requireJwtSecret);
router.use(jwtAuth('admin'));

router.get('/features', controller.listFeatures.bind(controller));
router.post('/features', requireJson, validateRequest(createFeatureSchema), controller.createFeature.bind(controller));
router.put('/features/:id', requireJson, validateRequest(updateFeatureSchema), controller.updateFeature.bind(controller));
router.delete('/features/:id', validateRequest(featureIdParamSchema), controller.deleteFeature.bind(controller));
router.get('/plans/:planId/entitlements', validateRequest(planIdParamSchema), controller.getPlanEntitlements.bind(controller));
router.post('/plans/:planId/entitlements', requireJson, validateRequest(planEntitlementsSchema), controller.savePlanEntitlements.bind(controller));
router.get('/licenses/:licenseId/entitlements/overrides', validateRequest(licenseIdParamSchema), controller.getLicenseOverrides.bind(controller));
router.post('/licenses/:licenseId/entitlements/overrides', requireJson, validateRequest(licenseEntitlementsSchema), controller.saveLicenseOverrides.bind(controller));

// Plan CRUD
router.get('/plans', planController.list.bind(planController));
router.post('/plans', requireJson, planController.create.bind(planController));
router.get('/plans/:id', planController.get.bind(planController));
router.put('/plans/:id', requireJson, planController.update.bind(planController));
router.delete('/plans/:id', planController.remove.bind(planController));

// License admin CRUD
router.get('/licenses', licenseAdminController.list.bind(licenseAdminController));
router.post('/licenses', requireJson, validateRequest(createLicenseSchema), licenseAdminController.create.bind(licenseAdminController));
router.get('/licenses/:id', licenseAdminController.get.bind(licenseAdminController));
router.put('/licenses/:id', requireJson, licenseAdminController.update.bind(licenseAdminController));
router.post('/licenses/:id/regenerate-activation-key', licenseAdminController.regenerateActivationKey.bind(licenseAdminController));
router.delete('/licenses/:id', licenseAdminController.remove.bind(licenseAdminController));

// Subscription CRUD + lifecycle
router.get('/subscriptions', subscriptionController.list.bind(subscriptionController));
router.post('/subscriptions', requireJson, subscriptionController.create.bind(subscriptionController));
router.get('/subscriptions/:id', subscriptionController.get.bind(subscriptionController));
router.put('/subscriptions/:id', requireJson, subscriptionController.update.bind(subscriptionController));
router.delete('/subscriptions/:id', subscriptionController.remove.bind(subscriptionController));
router.post('/subscriptions/:id/renew', subscriptionController.renew.bind(subscriptionController));
router.post('/subscriptions/:id/cancel', subscriptionController.cancel.bind(subscriptionController));
router.post('/subscriptions/:id/mark-paid', subscriptionController.markPaid.bind(subscriptionController));

// Organization CRUD
router.get('/organizations', organizationController.list.bind(organizationController));
router.post('/organizations', requireJson, organizationController.create.bind(organizationController));
router.get('/organizations/:id', organizationController.get.bind(organizationController));
router.put('/organizations/:id', requireJson, organizationController.update.bind(organizationController));
router.delete('/organizations/:id', organizationController.remove.bind(organizationController));

// Device admin
router.get('/devices', deviceController.list.bind(deviceController));
router.get('/devices/:id', deviceController.get.bind(deviceController));
router.delete('/devices/:id', deviceController.remove.bind(deviceController));

// Admin management (SuperAdmin-only actions enforced in controller)
router.get('/admins', validateRequest(adminListSchema), controller.listAdmins.bind(controller));
router.post('/admins', requireJson, validateRequest(adminCreateSchema), controller.createAdmin.bind(controller));
router.put('/admins/:id', requireJson, validateRequest(adminUpdateSchema), controller.updateAdmin.bind(controller));
router.post('/admins/:id/disable', controller.disableAdmin.bind(controller));
router.post('/admins/:id/reset-password', requireJson, controller.resetAdminPassword.bind(controller));

// Admin audit
router.get('/admin-audit', validateRequest(adminAuditQuerySchema), controller.listAdminAudits.bind(controller));

export default router;
