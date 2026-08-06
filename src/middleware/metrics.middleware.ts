import { Request, Response, NextFunction } from 'express';
import { metricsService } from '../services/metrics.service';

export const metricsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        metricsService.recordRequest(req.path, duration);
        if (res.statusCode >= 500) {
            metricsService.recordError();
        }
    });
    next();
};
