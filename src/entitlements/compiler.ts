import { EntitlementMap } from '../types';

export const compileEntitlements = (baseEntitlements: EntitlementMap, overrides: EntitlementMap = {}): EntitlementMap => {
    return Object.keys(baseEntitlements).reduce<EntitlementMap>((acc, key) => {
        acc[key] = overrides.hasOwnProperty(key) ? overrides[key] : baseEntitlements[key];
        return acc;
    }, {});
};
