import { EntitlementMap } from '../types';

export const compileEntitlements = (baseEntitlements: EntitlementMap, overrides: EntitlementMap = {}): EntitlementMap => {
    const entitlements: EntitlementMap = { ...baseEntitlements };
    for (const key of Object.keys(overrides)) {
        entitlements[key] = overrides[key];
    }
    return entitlements;
};
