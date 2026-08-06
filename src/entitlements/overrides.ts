import { EntitlementMap } from '../types';
import { LicenseEntitlementOverride } from '@prisma/client';

export const getEntitlementOverrides = (
    overrides: (LicenseEntitlementOverride & { feature: { valueType: string } })[],
): EntitlementMap => {
    return overrides.reduce<EntitlementMap>((acc, item) => {
        if (item.feature.valueType === 'boolean') {
            acc[item.featureId] = item.booleanValue ?? false;
        } else {
            acc[item.featureId] = item.numericValue ?? 0;
        }
        return acc;
    }, {});
};
