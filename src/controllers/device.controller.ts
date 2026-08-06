import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/apiResponse';
import { DeviceRepository } from '../repositories/device.repository';

const repo = new DeviceRepository();

export class DeviceController {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            // optional filter by licenseId
            const licenseId = req.query.licenseId as string | undefined;
            if (licenseId) {
                const items = await repo.listByLicenseId(licenseId);
                return res.status(200).json(createResponse(items));
            }
            // fallback: list all devices (prisma client access)
            // Use direct prisma for simplicity
            const prisma = require('../prisma/client').default;
            const items = await prisma.device.findMany();
            return res.status(200).json(createResponse(items));
        } catch (err) {
            next(err);
        }
    }

    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const prisma = require('../prisma/client').default;
            const item = await prisma.device.findUnique({ where: { id: req.params.id } });
            if (!item) return res.status(404).json(createResponse(null, [{ code: 'NOT_FOUND', message: 'Device not found' }]));
            return res.status(200).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const prisma = require('../prisma/client').default;
            await prisma.device.delete({ where: { id: req.params.id } });
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}
