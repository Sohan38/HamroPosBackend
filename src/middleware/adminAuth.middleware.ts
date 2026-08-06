import { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { createResponse } from '../utils/apiResponse';
import { constantTimeCompare } from '../crypto/hashing';

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    const header = req.get('x-admin-api-key') ?? '';

    if (!env.adminApiKey) {
        return res.status(503).json(
            createResponse(null, [
                { code: 'ADMIN_NOT_CONFIGURED', message: 'Admin authentication is not configured on this server.' },
            ]),
        );
    }

    if (!constantTimeCompare(header, env.adminApiKey)) {
        return res.status(401).json(
            createResponse(null, [
                { code: 'UNAUTHORIZED', message: 'Invalid admin credentials.' },
            ]),
        );
    }

    next();
};
