import prisma from '../prisma/client';

export class OrganizationRepository {
    async findAll() {
        return prisma.organization.findMany();
    }

    async findById(id: string) {
        return prisma.organization.findUnique({ where: { id } });
    }

    async findByName(name: string) {
        return prisma.organization.findFirst({ where: { name } });
    }

    async create(data: { id: string; name: string; address?: string | null }) {
        return prisma.organization.create({ data });
    }

    async update(id: string, data: { name?: string; address?: string | null }) {
        return prisma.organization.update({ where: { id }, data });
    }

    async delete(id: string) {
        return prisma.organization.delete({ where: { id } });
    }
}

