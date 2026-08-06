import prisma from '../prisma/client';
import { FeatureValueType } from '../types';

export interface EntitlementInput {
    featureId: string;
    valueType: FeatureValueType;
    booleanValue?: boolean | null;
    numericValue?: number | null;
}

export class EntitlementRepository {
    async findPlanEntitlements(planId: string) {
        return prisma.planEntitlement.findMany({
            where: { planId },
            include: { feature: true },
        });
    }

    async findLicenseOverrides(licenseId: string) {
        return prisma.licenseEntitlementOverride.findMany({
            where: { licenseId },
            include: { feature: true },
        });
    }

    async savePlanEntitlements(planId: string, entitlements: EntitlementInput[]) {
        const data = entitlements.map((item) => ({
            planId,
            featureId: item.featureId,
            booleanValue: item.valueType === 'boolean' ? item.booleanValue ?? undefined : undefined,
            numericValue: item.valueType === 'numeric' ? item.numericValue ?? undefined : undefined,
        }));

        return prisma.$transaction([
            prisma.planEntitlement.deleteMany({ where: { planId } }),
            prisma.planEntitlement.createMany({ data }),
        ]);
    }

    async saveLicenseOverrides(licenseId: string, overrides: EntitlementInput[]) {
        const data = overrides.map((item) => ({
            licenseId,
            featureId: item.featureId,
            booleanValue: item.valueType === 'boolean' ? item.booleanValue ?? undefined : undefined,
            numericValue: item.valueType === 'numeric' ? item.numericValue ?? undefined : undefined,
        }));

        return prisma.$transaction([
            prisma.licenseEntitlementOverride.deleteMany({ where: { licenseId } }),
            prisma.licenseEntitlementOverride.createMany({ data }),
        ]);
    }
}
