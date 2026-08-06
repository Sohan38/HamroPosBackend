import prisma from '../prisma/client';

export class SubscriptionRepository {
    async findById(id: string) {
        return prisma.subscription.findUnique({
            where: { id },
            include: { organization: true, plan: true },
        });
    }

    async findAll() {
        return prisma.subscription.findMany({ include: { organization: true, plan: true } });
    }

    async create(data: { id: string; organizationId: string; planId: string; status?: string; isLifetime?: boolean; expiresAt?: Date | null; gracePeriodDays?: number | null }) {
        const payload: any = {
            id: data.id,
            organizationId: data.organizationId,
            planId: data.planId,
            startsAt: data.expiresAt ? new Date() : new Date(),
            status: data.status ?? 'active',
            isLifetime: data.isLifetime ?? false,
        };
        if (data.expiresAt !== undefined && data.expiresAt !== null) payload.expiresAt = data.expiresAt;
        if (data.gracePeriodDays !== undefined && data.gracePeriodDays !== null) payload.gracePeriodDays = data.gracePeriodDays;
        return prisma.subscription.create({ data: payload });
    }

    async update(id: string, data: any) {
        return prisma.subscription.update({ where: { id }, data });
    }

    async delete(id: string) {
        return prisma.subscription.delete({ where: { id } });
    }
}
