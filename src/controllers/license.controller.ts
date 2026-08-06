import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/apiResponse';
import { ActivationService } from '../services/activation.service';
import { ApiError } from '../utils/errors';
import { CryptoService } from '../services/crypto.service';

const activationService = new ActivationService();
const cryptoService = new CryptoService();

export class LicenseController {
    async activate(req: Request, res: Response, next: NextFunction) {
        try {
            const { activationKey, deviceId, deviceMeta } = req.body;
            const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
            const userAgent = req.get('User-Agent') ?? null;

            const result = await activationService.activateLicense({
                activationKey,
                deviceId,
                deviceMeta,
                ipAddress,
                userAgent,
            });

            return res.status(200).json(createResponse(result));
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.code === 'SIGNING_DISABLED') {
                    return res.status(503).json(createResponse(null, [{ code: error.code, message: error.message }]));
                }
                return res.status(400).json(createResponse(null, [{ code: error.code, message: error.message }]));
            }
            next(error);
        }
    }

    async verify(req: Request, res: Response, next: NextFunction) {
        try {
            const { licenseId, deviceId } = req.body;
            const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
            const userAgent = req.get('User-Agent') ?? null;

            const result = await activationService.verifyLicense({
                licenseId,
                deviceId,
                ipAddress,
                userAgent,
            });

            return res.status(200).json(createResponse(result));
        } catch (error) {
            if (error instanceof ApiError) {
                if (error.code === 'SIGNING_DISABLED') {
                    return res.status(503).json(createResponse(null, [{ code: error.code, message: error.message }]));
                }
                return res.status(400).json(createResponse(null, [{ code: error.code, message: error.message }]));
            }
            next(error);
        }
    }

    async resetDevices(req: Request, res: Response, next: NextFunction) {
        try {
            const { activationKey, deviceId } = req.body;
            const ipAddress = req.ip || req.socket.remoteAddress || '0.0.0.0';
            const userAgent = req.get('User-Agent') ?? null;

            const result = await activationService.resetDevices({
                activationKey,
                deviceId,
                ipAddress,
                userAgent,
            });

            return res.status(200).json(createResponse(result));
        } catch (error) {
            if (error instanceof ApiError) {
                return res.status(400).json(createResponse(null, [{ code: error.code, message: error.message }]));
            }
            next(error);
        }
    }

    async getPublicKeys(req: Request, res: Response, next: NextFunction) {
        try {
            const keys = cryptoService.getPublicKeys();
            return res.status(200).json(createResponse({ keys }));
        } catch (err) {
            next(err);
        }
    }
}
