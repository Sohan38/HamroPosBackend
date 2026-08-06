import { Request } from 'express';

declare global {
    namespace Express {
        interface Request {
            user?: {
                sub: string;
                role: string;
            };
            rawBody?: string;
        }
    }
}

export { };
