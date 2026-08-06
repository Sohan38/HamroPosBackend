import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SubscriptionService } from '../services/subscription.service';

vi.mock('../repositories/subscription.repository', () => ({
    SubscriptionRepository: vi.fn().mockImplementation(function () {
        return {
            findById: vi.fn(async (id: string) => ({ id, gracePeriodDays: 2, status: 'past_due' })),
            update: vi.fn(async (id: string, data: any) => ({ id, ...data })),
        };
    }),
}));

describe('SubscriptionService billing handlers', () => {
    beforeEach(() => vi.clearAllMocks());

    it('marks subscription active on invoice paid', async () => {
        const svc = new SubscriptionService();
        const result = await svc.handleInvoicePaid({ subscriptionId: 'sub-1' });
        expect(result).toBeTruthy();
        expect(result!.status).toBe('active');
    });

    it('decrements grace or marks unpaid on payment failed', async () => {
        const svc = new SubscriptionService();
        const res1 = await svc.handlePaymentFailed({ subscriptionId: 'sub-1' });
        expect(res1).toBeTruthy();
        expect(res1!.gracePeriodDays).toBe(1);

        // second failure should mark unpaid
        const mockRepo = await import('../repositories/subscription.repository');
        mockRepo.SubscriptionRepository = vi.fn().mockImplementation(function () {
            return {
                findById: vi.fn(async () => ({ id: 'sub-1', gracePeriodDays: 0, status: 'active' })),
                update: vi.fn(async (id: string, data: any) => ({ id, ...data })),
            };
        });

        const svc2 = new SubscriptionService();
        const res2 = await svc2.handlePaymentFailed({ subscriptionId: 'sub-1' });
        expect(res2).toBeTruthy();
        expect(res2!.status).toBe('unpaid');
    });
});
