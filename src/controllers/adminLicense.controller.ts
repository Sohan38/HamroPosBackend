import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/apiResponse';
import { LicenseRepository } from '../repositories/license.repository';
import { LicenseAdminService } from '../services/licenseAdmin.service';

const repo = new LicenseRepository();
const licenseAdminService = new LicenseAdminService();

export class LicenseAdminController {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await repo.findAll();
            return res.status(200).json(createResponse(items));
        } catch (err) {
            next(err);
        }
    }

    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await repo.findById(req.params.id);
            if (!item) return res.status(404).json(createResponse(null, [{ code: 'NOT_FOUND', message: 'License not found' }]));
            return res.status(200).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, subscriptionId, organizationName, planName, status, expiresAt, maxDevicesOverride, overrides } = req.body;
            const result = await licenseAdminService.createLicense({
                id,
                subscriptionId,
                organizationName,
                planName,
                status,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                maxDevicesOverride,
                overrides,
            });
            return res.status(201).json(createResponse(result));
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await repo.update(req.params.id, req.body);
            return res.status(200).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            await repo.delete(req.params.id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}
