import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/apiResponse';
import { ApiError } from '../utils/errors';
import { FeatureService } from '../services/feature.service';
import { EntitlementService } from '../services/entitlement.service';
import { AuthService } from '../services/auth.service';
import { AdminUserService } from '../services/adminUser.service';
import { env } from '../config/env';
import { AdminAuditService } from '../services/adminAudit.service';

const featureService = new FeatureService();
const entitlementService = new EntitlementService();
const authService = new AuthService();
const adminUserService = new AdminUserService();
const adminAuditService = new AdminAuditService();

export class AdminController {
    async listFeatures(_req: Request, res: Response, next: NextFunction) {
        try {
            const features = await featureService.listFeatures();
            return res.status(200).json(createResponse(features));
        } catch (error) {
            next(error);
        }
    }

    async createFeature(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, name, valueType, description } = req.body;
            const feature = await featureService.createFeature({ id, name, valueType, description });
            return res.status(201).json(createResponse(feature));
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(400).json(createResponse(null, [{ code: error.code, message: error.message }]));
            }
            next(error);
        }
    }

    async getPlanEntitlements(req: Request, res: Response, next: NextFunction) {
        try {
            const { planId } = req.params;
            const entitlements = await entitlementService.compilePlanEntitlements(planId);
            return res.status(200).json(createResponse(entitlements));
        } catch (error) {
            next(error);
        }
    }

    async savePlanEntitlements(req: Request, res: Response, next: NextFunction) {
        try {
            const { planId } = req.params;
            const entitlements = req.body.entitlements as { featureId: string; valueType: 'boolean' | 'numeric'; booleanValue?: boolean | null; numericValue?: number | null; }[];
            await entitlementService.savePlanEntitlements(planId, entitlements);
            return res.status(200).json(createResponse({ planId, entitlements }));
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(400).json(createResponse(null, [{ code: error.code, message: error.message }]));
            }
            next(error);
        }
    }

    async getLicenseOverrides(req: Request, res: Response, next: NextFunction) {
        try {
            const { licenseId } = req.params;
            const overrides = await entitlementService.getLicenseOverrides(licenseId);
            return res.status(200).json(createResponse(overrides));
        } catch (error) {
            next(error);
        }
    }

    async saveLicenseOverrides(req: Request, res: Response, next: NextFunction) {
        try {
            const { licenseId } = req.params;
            const overrides = req.body.overrides as { featureId: string; valueType: 'boolean' | 'numeric'; booleanValue?: boolean | null; numericValue?: number | null; }[];
            await entitlementService.saveLicenseOverrides(licenseId, overrides);
            return res.status(200).json(createResponse({ licenseId, overrides }));
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(400).json(createResponse(null, [{ code: error.code, message: error.message }]));
            }
            next(error);
        }
    }

    async issueToken(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password, expiresIn } = req.body as { email?: string; password?: string; expiresIn?: string };
            if (!email || !password) {
                return res.status(400).json(createResponse(null, [{ code: 'VALIDATION_ERROR', message: 'email and password required' }]));
            }

            const user = await adminUserService.verifyCredentials(email, password);
            if (!user) {
                return res.status(401).json(createResponse(null, [{ code: 'UNAUTHORIZED', message: 'Invalid credentials' }]));
            }

            const token = authService.signToken(user.id, user.role, expiresIn);
            return res.status(200).json(createResponse({ token }));
        } catch (error) {
            next(error);
        }
    }
    // One-time setup: create initial admin using ADMIN_API_KEY header when no admin users exist
    async setupAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            // Only enabled when explicitly allowed via configuration
            if (!env.enableAdminBootstrap) {
                return res.status(404).json(createResponse(null, [{ code: 'NOT_FOUND', message: 'Not found' }]));
            }

            const { email, password } = req.body as { email: string; password: string };
            if (!email || !password) {
                return res.status(400).json(createResponse(null, [{ code: 'VALIDATION_ERROR', message: 'email and password required' }]));
            }

            const count = await adminUserService.countUsers();
            if (count > 0) {
                return res.status(400).json(createResponse(null, [{ code: 'ALREADY_EXISTS', message: 'Admin user already exists' }]));
            }

            const user = await adminUserService.createAdmin(email, password, 'superadmin');
            await adminAuditService.logAdminAction({
                adminId: user.id,
                targetAdminId: user.id,
                action: 'admin_created',
                details: `Initial SuperAdmin created ${user.email}`,
                isSuccess: true,
                ipAddress: req.ip || req.socket.remoteAddress || '0.0.0.0',
                userAgent: req.get('User-Agent') ?? null,
            });
            return res.status(201).json(createResponse({ id: user.id, email: user.email, role: user.role }));
        } catch (error) {
            next(error);
        }
    }

    // Create new admin (SuperAdmin only)
    async createAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const requester = req.user!;
            const current = await adminUserService.findById(requester.sub);
            if (!current || !current.isActive) return res.status(403).json(createResponse(null, [{ code: 'FORBIDDEN', message: 'Forbidden' }]));
            if (current.role !== 'superadmin') return res.status(403).json(createResponse(null, [{ code: 'FORBIDDEN', message: 'Forbidden' }]));

            const { email, password, role } = req.body as { email: string; password: string; role?: string };
            if (!email || !password) return res.status(400).json(createResponse(null, [{ code: 'VALIDATION_ERROR', message: 'email and password required' }]));

            const user = await adminUserService.createAdmin(email, password, role ?? 'admin');
            await adminAuditService.logAdminAction({
                adminId: current.id,
                targetAdminId: user.id,
                action: 'admin_created',
                details: `Admin created ${user.email} role=${user.role}`,
                isSuccess: true,
                ipAddress: req.ip || req.socket.remoteAddress || '0.0.0.0',
                userAgent: req.get('User-Agent') ?? null,
            });
            return res.status(201).json(createResponse({ id: user.id, email: user.email, role: user.role }));
        } catch (err) {
            next(err);
        }
    }

    async updateAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const requester = req.user!;
            const current = await adminUserService.findById(requester.sub);
            if (!current || !current.isActive) return res.status(403).json(createResponse(null, [{ code: 'FORBIDDEN', message: 'Forbidden' }]));
            if (current.role !== 'superadmin') return res.status(403).json(createResponse(null, [{ code: 'FORBIDDEN', message: 'Forbidden' }]));

            const id = req.params.id;
            const { email, role, disabled } = req.body as { email?: string; role?: string; disabled?: boolean };
            const user = await adminUserService.updateAdmin(id, { email, role, disabled });
            await adminAuditService.logAdminAction({
                adminId: current.id,
                targetAdminId: user.id,
                action: 'admin_updated',
                details: `Updated admin ${user.email}`,
                isSuccess: true,
                ipAddress: req.ip || req.socket.remoteAddress || '0.0.0.0',
                userAgent: req.get('User-Agent') ?? null,
            });
            return res.status(200).json(createResponse({ id: user.id, email: user.email, role: user.role, disabled: !user.isActive }));
        } catch (err) {
            next(err);
        }
    }

    async disableAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const requester = req.user!;
            const current = await adminUserService.findById(requester.sub);
            if (!current || !current.isActive) return res.status(403).json(createResponse(null, [{ code: 'FORBIDDEN', message: 'Forbidden' }]));
            if (current.role !== 'superadmin') return res.status(403).json(createResponse(null, [{ code: 'FORBIDDEN', message: 'Forbidden' }]));

            const id = req.params.id;
            await adminUserService.disableAdmin(id);
            await adminAuditService.logAdminAction({
                adminId: current.id,
                targetAdminId: id,
                action: 'admin_disabled',
                details: `Disabled admin ${id}`,
                isSuccess: true,
                ipAddress: req.ip || req.socket.remoteAddress || '0.0.0.0',
                userAgent: req.get('User-Agent') ?? null,
            });
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async resetAdminPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const requester = req.user!;
            const current = await adminUserService.findById(requester.sub);
            if (!current || !current.isActive) return res.status(403).json(createResponse(null, [{ code: 'FORBIDDEN', message: 'Forbidden' }]));
            if (current.role !== 'superadmin') return res.status(403).json(createResponse(null, [{ code: 'FORBIDDEN', message: 'Forbidden' }]));

            const id = req.params.id;
            const { password } = req.body as { password: string };
            if (!password) return res.status(400).json(createResponse(null, [{ code: 'VALIDATION_ERROR', message: 'password required' }]));
            await adminUserService.resetPassword(id, password);
            await adminAuditService.logAdminAction({
                adminId: current.id,
                targetAdminId: id,
                action: 'admin_password_reset',
                details: `Password reset for admin ${id}`,
                isSuccess: true,
                ipAddress: req.ip || req.socket.remoteAddress || '0.0.0.0',
                userAgent: req.get('User-Agent') ?? null,
            });
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async listAdmins(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt((req.query.page as string) || '1', 10);
            const perPage = parseInt((req.query.perPage as string) || '20', 10);
            const search = (req.query.q as string) || undefined;
            const sort = (req.query.sort as string) || undefined;

            const result = await adminUserService.listAdmins({ page, perPage, search, sort });
            return res.status(200).json(createResponse({ data: result.data, meta: { page: result.page, perPage: result.perPage, total: result.total } }));
        } catch (err) {
            next(err);
        }
    }

    async listAdminAudits(req: Request, res: Response, next: NextFunction) {
        try {
            const page = parseInt((req.query.page as string) || '1', 10);
            const perPage = parseInt((req.query.perPage as string) || '20', 10);
            const adminId = (req.query.adminId as string) || undefined;
            const action = (req.query.action as string) || undefined;
            const from = req.query.from ? new Date(req.query.from as string) : undefined;
            const to = req.query.to ? new Date(req.query.to as string) : undefined;

            const result = await adminAuditService.listAudits({ adminId, action, from, to, page, perPage });
            return res.status(200).json(createResponse({ data: result.data, meta: { page: result.page, perPage: result.perPage, total: result.total } }));
        } catch (err) {
            next(err);
        }
    }
}
