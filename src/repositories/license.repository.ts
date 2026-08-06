import prisma from '../prisma/client';

export class LicenseRepository {
    async findByActivationKeyLookup(activationKeyLookup: string) {
        return prisma.license.findUnique({
            where: { activationKeyLookup },
            include: {
                subscription: {
                    include: { organization: true, plan: true },
                },
            },
        });
    }

    async findById(id: string) {
        return prisma.license.findUnique({
            where: { id },
            include: {
                subscription: {
                    include: { organization: true, plan: true },
                },
            },
        });
    }

    async findAll() {
        return prisma.license.findMany({ include: { subscription: { include: { organization: true, plan: true } } } });
    }

    async create(data: any) {
        return prisma.license.create({ data });
    }

    async update(id: string, data: any) {
        return prisma.license.update({ where: { id }, data });
    }

    async delete(id: string) {
        return prisma.license.delete({ where: { id } });
    }

    async countDevices(licenseId: string) {
        return prisma.device.count({
            where: { licenseId },
        });
    }
}
