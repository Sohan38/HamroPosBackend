import { NextFunction, Request, Response } from 'express';
import prisma from '../prisma/client';
import { env } from '../config/env';
import { createResponse } from '../utils/apiResponse';

export const setupGuard = async (req: Request, res: Response, next: NextFunction) => {
    // Only allow when explicitly enabled via ENABLE_ADMIN_BOOTSTRAP
    if (!env.enableAdminBootstrap) {
        return res.status(404).json(createResponse(null, [{ code: 'NOT_FOUND', message: 'Not found' }]));
    }

    if (!env.adminApiKey) {
        return res.status(503).json(createResponse(null, [{ code: 'CONFIG_ERROR', message: 'Admin bootstrap is enabled but ADMIN_API_KEY is not configured' }]));
    }

    try {
        const count = await prisma.adminUser.count();
        if (count > 0) {
            // One-time setup should be inaccessible after first admin is created
            return res.status(404).json(createResponse(null, [{ code: 'NOT_FOUND', message: 'Not found' }]));
        }
    } catch (err) {
        // If DB is not reachable, fail closed (do not allow setup)
        return res.status(503).json(createResponse(null, [{ code: 'DB_ERROR', message: 'Database unavailable' }]));
    }

    next();
};
