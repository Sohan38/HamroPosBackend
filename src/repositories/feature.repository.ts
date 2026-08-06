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
}
