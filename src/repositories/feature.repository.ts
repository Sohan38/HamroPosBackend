import prisma from '../prisma/client';
import { FeatureValueType } from '../types';

export class FeatureRepository {
    async findAll() {
        return prisma.feature.findMany();
    }

    async findById(featureId: string) {
        return prisma.feature.findUnique({
            where: { id: featureId },
        });
    }

    async create(feature: { id: string; name: string; valueType: FeatureValueType; description?: string | null }) {
        return prisma.feature.create({
            data: {
                id: feature.id,
                name: feature.name,
                valueType: feature.valueType,
                description: feature.description ?? null,
            },
        });
    }

    async update(id: string, data: { name?: string; valueType?: FeatureValueType; description?: string | null }) {
        const payload: any = {};
        if (data.name !== undefined) payload.name = data.name;
        if (data.valueType !== undefined) payload.valueType = data.valueType;
        if (data.description !== undefined) payload.description = data.description;
        return prisma.feature.update({ where: { id }, data: payload });
    }

    async delete(id: string) {
        return prisma.feature.delete({ where: { id } });
    }
}
