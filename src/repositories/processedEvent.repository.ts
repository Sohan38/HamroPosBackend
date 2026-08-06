import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';

export class ProcessedEventRepository {
    async findByProviderEventId(provider: string, providerEventId: string) {
        return prisma.processedEvent.findFirst({ where: { provider, providerEventId } });
    }

    async create(data: { provider: string; providerEventId: string; eventType: string }) {
        try {
            return await prisma.processedEvent.create({ data });
        } catch (err) {
            if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
                return this.findByProviderEventId(data.provider, data.providerEventId);
            }
            throw err;
        }
    }
}
