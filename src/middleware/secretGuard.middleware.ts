import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { createResponse } from '../utils/apiResponse';

export const requireSigningEnabled = (req: Request, res: Response, next: NextFunction) => {
    if (!env.ed25519PrivateKey) {
        return res.status(503).json(createResponse(null, [{ code: 'SIGNING_DISABLED', message: 'Signing is not available in this environment' }]));
    }
    next();
};

export const requireJwtSecret = (req: Request, res: Response, next: NextFunction) => {
    if (!env.jwtSecret) {
        return res.status(503).json(createResponse(null, [{ code: 'CONFIG_ERROR', message: 'JWT secret is not configured' }]));
    }
    next();
};
