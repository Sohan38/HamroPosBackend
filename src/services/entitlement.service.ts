import { EntitlementMap } from '../types';
import { EntitlementRepository } from '../repositories/entitlement.repository';
import { getEntitlementOverrides } from '../entitlements/overrides';
import { compileEntitlements } from '../entitlements/compiler';

export class EntitlementService {
    private repository = new EntitlementRepository();

    async compilePlanEntitlements(planId: string): Promise<EntitlementMap> {
        const planEntitlements = await this.repository.findPlanEntitlements(planId);
        return planEntitlements.reduce<EntitlementMap>((acc, item) => {
            if (item.feature.valueType === 'boolean') {
                acc[item.featureId] = item.booleanValue;
            } else {
                acc[item.featureId] = item.numericValue ?? 0;
            }
            return acc;
        }, {});
    }

    async compileLicenseEntitlements(planId: string, licenseId: string): Promise<EntitlementMap> {
        const baseEntitlements = await this.compilePlanEntitlements(planId);
        const overrides = await this.repository.findLicenseOverrides(licenseId);
        const overrideMap = getEntitlementOverrides(overrides);
        return compileEntitlements(baseEntitlements, overrideMap);
    }

    async savePlanEntitlements(planId: string, entitlements: {
        featureId: string;
        valueType: 'boolean' | 'numeric';
        booleanValue?: boolean | null;
        numericValue?: number | null;
    }[]) {
        await this.repository.savePlanEntitlements(planId, entitlements);
    }

    async saveLicenseOverrides(licenseId: string, overrides: {
        featureId: string;
        valueType: 'boolean' | 'numeric';
        booleanValue?: boolean | null;
        numericValue?: number | null;
    }[]) {
        await this.repository.saveLicenseOverrides(licenseId, overrides);
    }

    async getLicenseOverrides(licenseId: string): Promise<EntitlementMap> {
        const overrides = await this.repository.findLicenseOverrides(licenseId);
        return getEntitlementOverrides(overrides);
    }
}
