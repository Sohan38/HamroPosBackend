import prisma from '../prisma/client';

export class InvoiceRepository {
    async create(data: { id: string; subscriptionId: string; provider: string; providerInvoiceId?: string | null; amountPaid: number; currency: string; status: string; rawPayload: any }) {
        return prisma.invoice.create({ data });
    }

    async findByProviderInvoiceId(provider: string, providerInvoiceId: string) {
        return prisma.invoice.findFirst({ where: { provider, providerInvoiceId } });
    }

    async findBySubscriptionId(subscriptionId: string) {
        return prisma.invoice.findMany({ where: { subscriptionId } });
    }

    async findById(id: string) {
        return prisma.invoice.findUnique({ where: { id } });
    }
}
