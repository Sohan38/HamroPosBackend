import { Request, Response, NextFunction } from 'express';
import { createResponse } from '../utils/apiResponse';
import { BillingService } from '../services/billing.service';
import { env } from '../config/env';
import crypto from 'crypto';

const billingService = new BillingService();

export class BillingController {
    async handleWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            const event = req.body;

            // Provider-specific verification: Stripe-like HMAC verification
            const stripeSig = req.get('stripe-signature') ?? '';
            if (stripeSig && env.billingStripeWebhookSecret) {
                // compute HMAC SHA256
                const payloadRaw = req.rawBody ?? JSON.stringify(req.body);
                const expected = crypto.createHmac('sha256', env.billingStripeWebhookSecret).update(payloadRaw).digest('hex');
                if (expected !== stripeSig) {
                    return res.status(401).json(createResponse(null, [{ code: 'UNAUTHORIZED', message: 'Invalid stripe signature' }]));
                }
            } else {
                const signature = req.get('x-billing-signature') ?? '';
                if (!env.billingWebhookSecret || signature !== env.billingWebhookSecret) {
                    return res.status(401).json(createResponse(null, [{ code: 'UNAUTHORIZED', message: 'Invalid webhook signature' }]));
                }
            }
            await billingService.handleEvent(event);
            return res.status(200).json(createResponse({ success: true }));
        } catch (err) {
            next(err);
        }
    }
}
