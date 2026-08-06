import prisma from '../prisma/client';
import { EntitlementMap } from '../types';

export const resolveEntitlements = async (planId: string): Promise<EntitlementMap> => {
    const entitlements = await prisma.planEntitlement.findMany({
        where: { planId },
        include: { feature: true },
    });

    return entitlements.reduce<EntitlementMap>((acc, item) => {
        if (item.feature.valueType === 'boolean') {
            acc[item.featureId] = item.booleanValue;
        } else {
            acc[item.featureId] = item.numericValue ?? 0;
        }
        return acc;
    }, {});
};
