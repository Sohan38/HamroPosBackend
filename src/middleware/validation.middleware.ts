import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { createResponse } from '../utils/apiResponse';

export const validateRequest = (schema: AnyZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
        body: req.body,
        params: req.params,
        query: req.query,
    });

    if (!result.success) {
        const errors = result.error.errors.map((issue) => ({
            code: 'VALIDATION_ERROR',
            message: issue.message,
        }));
        return res.status(400).json(createResponse(null, errors));
    }

    next();
};
