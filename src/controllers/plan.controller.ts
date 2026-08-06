import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/apiResponse';
import { PlanService } from '../services/plan.service';
import { ApiError } from '../utils/errors';

const planService = new PlanService();

export class PlanController {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await planService.listPlans();
            return res.status(200).json(createResponse(items));
        } catch (err) {
            next(err);
        }
    }

    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const item = await planService.getPlan(id);
            if (!item) return res.status(404).json(createResponse(null, [{ code: 'NOT_FOUND', message: 'Plan not found' }]));
            return res.status(200).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, name, maxDevices, price, description } = req.body;
            const item = await planService.createPlan({ id, name, maxDevices, price, description });
            return res.status(201).json(createResponse(item));
        } catch (err) {
            if (err instanceof ApiError) return res.status(400).json(createResponse(null, [{ code: err.code, message: err.message }]));
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const { name, maxDevices, price, description } = req.body;
            const item = await planService.updatePlan(id, { name, maxDevices, price, description });
            return res.status(200).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            await planService.deletePlan(id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}
