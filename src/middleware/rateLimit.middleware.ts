import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import { createResponse } from '../utils/apiResponse';

export const activationRateLimiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        return res
            .status(429)
            .json(
                createResponse(null, [
                    {
                        code: 'TOO_MANY_REQUESTS',
                        message: 'Too many activation requests from this IP, please try again later.',
                    },
                ]),
            );
    },
});

export const authRateLimiter = rateLimit({
    windowMs: env.rateLimitWindowMs,
    max: env.rateLimitMax,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => {
        return res.status(429).json(
            createResponse(null, [
                {
                    code: 'TOO_MANY_REQUESTS',
                    message: 'Too many authentication requests, please try again later.',
                },
            ]),
        );
    },
});
