import { SubscriptionRepository } from '../repositories/subscription.repository';

export class SubscriptionService {
    private repo = new SubscriptionRepository();

    async list() {
        return this.repo.findAll();
    }

    async get(id: string) {
        return this.repo.findById(id);
    }

    async create(data: { id: string; organizationId: string; planId: string; status?: string; isLifetime?: boolean; expiresAt?: Date | null; gracePeriodDays?: number | null }) {
        return this.repo.create(data);
    }

    async update(id: string, data: any) {
        return this.repo.update(id, data);
    }

    async delete(id: string) {
        return this.repo.delete(id);
    }

    async renew(id: string, extendDays: number) {
        const sub = await this.repo.findById(id);
        if (!sub) return null;
        const newExpiry = sub.expiresAt ? new Date(sub.expiresAt.getTime() + extendDays * 24 * 3600 * 1000) : null;
        return this.repo.update(id, { expiresAt: newExpiry, status: 'active' });
    }

    async cancel(id: string) {
        return this.repo.update(id, { status: 'cancelled' });
    }

    async markPaid(id: string) {
        return this.repo.update(id, { status: 'active' });
    }

    // Handle invoice paid webhook payload. Expects `subscription` and `amount_paid` fields.
    async handleInvoicePaid(invoice: any) {
        const subscriptionId = invoice.subscriptionId || invoice.subscription?.id;
        if (!subscriptionId) return null;

        // idempotent: mark paid and clear grace
        return this.repo.update(subscriptionId, { status: 'active', gracePeriodDays: 0 });
    }

    // Handle payment failed webhook. Increase grace or cancel after threshold.
    async handlePaymentFailed(invoice: any) {
        const subscriptionId = invoice.subscriptionId || invoice.subscription?.id;
        if (!subscriptionId) return null;

        const sub = await this.repo.findById(subscriptionId);
        if (!sub) return null;

        const currentGrace = sub.gracePeriodDays ?? 0;
        // simple policy: decrement grace, if none left mark unpaid
        if (currentGrace > 0) {
            return this.repo.update(subscriptionId, { gracePeriodDays: Math.max(0, currentGrace - 1) });
        }

        return this.repo.update(subscriptionId, { status: 'unpaid' });
    }
}

