import { NextFunction, Request, Response } from 'express';
import { createResponse } from '../utils/apiResponse';

export const requireJson = (req: Request, res: Response, next: NextFunction) => {
    if (!req.is('application/json')) {
        return res.status(415).json(createResponse(null, [{ code: 'UNSUPPORTED_MEDIA_TYPE', message: 'Content type must be application/json' }]));
    }
    next();
};
