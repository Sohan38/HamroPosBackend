import { NextFunction, Request, Response } from 'express';
import { ApiError as ApiErrorClass } from '../utils/errors';
import { createResponse } from '../utils/apiResponse';

export const errorMiddleware = (err: Error, req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof ApiErrorClass) {
        return res.status(400).json(createResponse(null, [{ code: err.code, message: err.message }]));
    }

    console.error(err);
    return res.status(500).json(createResponse(null, [{ code: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred.' }]));
};
