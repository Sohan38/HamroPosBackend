import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/apiResponse';
import { SubscriptionService } from '../services/subscription.service';

const service = new SubscriptionService();

export class SubscriptionController {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await service.list();
            return res.status(200).json(createResponse(items));
        } catch (err) {
            next(err);
        }
    }

    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await service.get(req.params.id);
            if (!item) return res.status(404).json(createResponse(null, [{ code: 'NOT_FOUND', message: 'Subscription not found' }]));
            return res.status(200).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const data = req.body;
            const item = await service.create(data);
            return res.status(201).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await service.update(req.params.id, req.body);
            return res.status(200).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            await service.delete(req.params.id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }

    async renew(req: Request, res: Response, next: NextFunction) {
        try {
            const { extendDays } = req.body as { extendDays?: number };
            const result = await service.renew(req.params.id, extendDays ?? 30);
            return res.status(200).json(createResponse(result));
        } catch (err) {
            next(err);
        }
    }

    async cancel(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await service.cancel(req.params.id);
            return res.status(200).json(createResponse(result));
        } catch (err) {
            next(err);
        }
    }

    async markPaid(req: Request, res: Response, next: NextFunction) {
        try {
            const result = await service.markPaid(req.params.id);
            return res.status(200).json(createResponse(result));
        } catch (err) {
            next(err);
        }
    }
}
