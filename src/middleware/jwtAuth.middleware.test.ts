import { vi, describe, it, expect, beforeEach } from 'vitest';
import { NextFunction } from 'express';
import { jwtAuth } from './jwtAuth.middleware';
import { AuthService } from '../services/auth.service';

// Minimal mocks for express req/res/next
const makeReq = (authHeader?: string) => ({ get: (h: string) => authHeader });
const makeRes = () => {
    const status = vi.fn(() => res);
    const json = vi.fn(() => res);
    const res: any = { status, json };
    return res;
};

describe('jwtAuth middleware', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('rejects missing Authorization header', () => {
        const mw = jwtAuth('admin');
        const req: any = makeReq(undefined);
        const res: any = makeRes();
        const next = vi.fn() as unknown as NextFunction;

        mw(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('rejects invalid token', () => {
        vi.spyOn(AuthService.prototype, 'verifyToken').mockImplementation(() => { throw new Error('bad'); });
        const mw = jwtAuth('admin');
        const req: any = makeReq('Bearer badtoken');
        const res: any = makeRes();
        const next = vi.fn() as unknown as NextFunction;

        mw(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(next).not.toHaveBeenCalled();
    });

    it('allows superadmin for admin-required route', () => {
        vi.spyOn(AuthService.prototype, 'verifyToken').mockReturnValue({ role: 'superadmin', id: '1' });
        const mw = jwtAuth('admin');
        const req: any = makeReq('Bearer token');
        const res: any = makeRes();
        const next = vi.fn() as unknown as NextFunction;

        mw(req, res, next);

        expect(next).toHaveBeenCalled();
    });

    it('forbids insufficient role', () => {
        vi.spyOn(AuthService.prototype, 'verifyToken').mockReturnValue({ role: 'viewer', id: '2' });
        const mw = jwtAuth('admin');
        const req: any = makeReq('Bearer token');
        const res: any = makeRes();
        const next = vi.fn() as unknown as NextFunction;

        mw(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(next).not.toHaveBeenCalled();
    });

    it('allows when multiple roles provided and match', () => {
        vi.spyOn(AuthService.prototype, 'verifyToken').mockReturnValue({ role: 'admin', id: '3' });
        const mw = jwtAuth(['admin', 'manager']);
        const req: any = makeReq('Bearer token');
        const res: any = makeRes();
        const next = vi.fn() as unknown as NextFunction;

        mw(req, res, next);

        expect(next).toHaveBeenCalled();
    });
});
