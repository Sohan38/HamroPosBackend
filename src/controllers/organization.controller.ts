import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/apiResponse';
import { OrganizationRepository } from '../repositories/organization.repository';

const repo = new OrganizationRepository();

export class OrganizationController {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await repo.findAll();
            return res.status(200).json(createResponse(items));
        } catch (err) {
            next(err);
        }
    }

    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await repo.findById(req.params.id);
            if (!item) return res.status(404).json(createResponse(null, [{ code: 'NOT_FOUND', message: 'Organization not found' }]));
            return res.status(200).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, name, address } = req.body;
            const item = await repo.create({ id, name, address });
            return res.status(201).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, address } = req.body;
            const item = await repo.update(req.params.id, { name, address });
            return res.status(200).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            await repo.delete(req.params.id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}

