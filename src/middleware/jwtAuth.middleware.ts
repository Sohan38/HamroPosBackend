import { NextFunction, Request, Response } from 'express';
import { createResponse } from '../utils/apiResponse';
import { AuthService } from '../services/auth.service';

const auth = new AuthService();

const normalizeRoles = (r?: string | string[]) => {
    if (!r) return undefined;
    return Array.isArray(r) ? r : [r];
};

const hasRequiredRole = (payloadRole: string | undefined, requiredRoles?: string[]) => {
    if (!requiredRoles || requiredRoles.length === 0) return true;
    if (!payloadRole) return false;
    // If required explicitly asks for superadmin, only superadmin is allowed
    if (requiredRoles.includes('superadmin')) {
        return payloadRole === 'superadmin';
    }
    // Otherwise allow if payload role is one of required roles OR payload is superadmin
    return requiredRoles.includes(payloadRole) || payloadRole === 'superadmin';
};

export const jwtAuth = (requiredRole?: string | string[]) => (req: Request, res: Response, next: NextFunction) => {
    const header = req.get('Authorization') ?? '';
    if (!header.startsWith('Bearer ')) {
        return res.status(401).json(createResponse(null, [{ code: 'UNAUTHORIZED', message: 'Missing token' }]));
    }

    const token = header.replace('Bearer ', '').trim();
    try {
        const payload = auth.verifyToken<any>(token);
        const normalizedRole = typeof payload.role === 'string' ? payload.role.toLowerCase() : undefined;
        const roles = normalizeRoles(requiredRole);
        if (roles && !hasRequiredRole(normalizedRole, roles)) {
            return res.status(403).json(createResponse(null, [{ code: 'FORBIDDEN', message: 'Insufficient role' }]));
        }

        // attach user info
        req.user = { ...payload, role: normalizedRole } as { sub: string; role: string };
        next();
    } catch (err) {
        // If the error is due to missing JWT secret, return 503 config error
        if (err instanceof Error && err.message && err.message.toLowerCase().includes('jwt_secret')) {
            return res.status(503).json(createResponse(null, [{ code: 'CONFIG_ERROR', message: 'Server misconfigured: JWT secret missing' }]));
        }
        return res.status(401).json(createResponse(null, [{ code: 'UNAUTHORIZED', message: 'Invalid token' }]));
    }
};
