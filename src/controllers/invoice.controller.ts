import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/apiResponse';
import { InvoiceRepository } from '../repositories/invoice.repository';

const repo = new InvoiceRepository();

export class InvoiceController {
    async getInvoice(req: Request, res: Response, next: NextFunction) {
        try {
            const id = req.params.id;
            const invoice = await repo.findByProviderInvoiceId('unknown', id) || await repo.findById(id);
            if (!invoice) return res.status(404).json(createResponse(null, [{ code: 'NOT_FOUND', message: 'Invoice not found' }]));
            return res.status(200).json(createResponse(invoice));
        } catch (err) {
            next(err);
        }
    }

    async listBySubscription(req: Request, res: Response, next: NextFunction) {
        try {
            const subscriptionId = req.params.subscriptionId;
            const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
            const perPage = Math.min(200, Math.max(1, parseInt((req.query.perPage as string) || '20', 10)));
            const items = await repo.findBySubscriptionId(subscriptionId);
            const start = (page - 1) * perPage;
            const paged = items.slice(start, start + perPage);
            const meta = { page, perPage, total: items.length };
            return res.status(200).json(createResponse({ data: paged, meta }));
        } catch (err) {
            next(err);
        }
    }
}
