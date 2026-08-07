import prisma from '../prisma/client';

export class PlanRepository {
    async findAll() {
        return prisma.plan.findMany();
    }

    async findById(id: string) {
        return prisma.plan.findUnique({ where: { id } });
    }

    async findByName(name: string) {
        return prisma.plan.findFirst({ where: { name } });
    }

    async create(data: { id: string; name: string; maxDevices?: number | null; price?: number | null; description?: string | null }) {
        const payload: any = { id: data.id, name: data.name };
        if (data.maxDevices !== undefined && data.maxDevices !== null) payload.maxDevices = data.maxDevices;
        if (data.price !== undefined && data.price !== null) payload.price = data.price;
        if (data.description !== undefined && data.description !== null) payload.description = data.description;
        return prisma.plan.create({ data: payload });
    }

    async update(id: string, data: { name?: string; maxDevices?: number | null; price?: number | null; description?: string | null }) {
        const payload: any = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.maxDevices !== undefined && data.maxDevices !== null) payload.maxDevices = data.maxDevices;
        if (data.price !== undefined && data.price !== null) payload.price = data.price;
        if (data.description !== undefined && data.description !== null) payload.description = data.description;
        return prisma.plan.update({ where: { id }, data: payload });
    }

    async delete(id: string) {
        return prisma.plan.delete({ where: { id } });
    }
}
