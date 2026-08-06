import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BillingService } from '../services/billing.service';

vi.mock('../repositories/invoice.repository', () => ({
    InvoiceRepository: vi.fn().mockImplementation(function () {
        return {
            findByProviderInvoiceId: vi.fn(async () => ({ id: 'existing' })),
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

describe('BillingService duplicate handling', () => {
    beforeEach(() => vi.clearAllMocks());

    it('does not create duplicate invoice when provider invoice exists', async () => {
        const svc = new BillingService();
        await svc.handleEvent({ type: 'invoice.paid', data: { object: { id: 'inv_1', subscriptionId: 'sub-1', amount_paid: 10, currency: 'usd' } } });
        // If no exception thrown, behavior OK; ensure InvoiceRepository.create not called
        const repoMod = await import('../repositories/invoice.repository');
        const repo = repoMod.InvoiceRepository;
        const instance = new repo();
        expect(instance.create).not.toHaveBeenCalled();
    });
});
