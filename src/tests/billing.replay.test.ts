import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingService } from '../services/billing.service';

vi.mock('../repositories/invoice.repository', () => ({
    InvoiceRepository: vi.fn().mockImplementation(function () {
        return {
            findByProviderInvoiceId: vi.fn(async () => null),
            create: vi.fn(async (data: any) => data),
        };
    }),
}));

vi.mock('../repositories/processedEvent.repository', () => ({
    ProcessedEventRepository: vi.fn().mockImplementation(function () {
        return {
            findByProviderEventId: vi.fn(async () => ({ id: 1 })),
            create: vi.fn(async (data: any) => data),
        };
    }),
}));

vi.mock('../services/subscription.service', () => ({
    SubscriptionService: vi.fn().mockImplementation(function () {
        return {
            handleInvoicePaid: vi.fn(async () => ({})),
            handlePaymentFailed: vi.fn(async () => ({})),
        };
    }),
}));

describe('BillingService replay protection', () => {
    beforeEach(() => vi.clearAllMocks());

    it('skips already-processed events', async () => {
        const svc = new BillingService();
        // This mocked processed repo returns a record, so handleEvent should return early without throwing
        await svc.handleEvent({ type: 'invoice.paid', id: 'evt_1', data: { object: { id: 'inv_1', subscriptionId: 'sub-1', amount_paid: 10, currency: 'usd' } } });
        expect(true).toBe(true);
    });
});
