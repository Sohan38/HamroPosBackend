import { LicenseRepository } from '../repositories/license.repository';
import { SubscriptionRepository } from '../repositories/subscription.repository';
import { EntitlementService } from './entitlement.service';
import { EntitlementMap } from '../types';

export class LicenseService {
    private licenseRepository = new LicenseRepository();
    private subscriptionRepository = new SubscriptionRepository();
    private entitlementService = new EntitlementService();

    async getLicenseByLookup(lookupHash: string) {
        return this.licenseRepository.findByActivationKeyLookup(lookupHash);
    }

    async getLicenseById(licenseId: string) {
        return this.licenseRepository.findById(licenseId);
    }

    async isSubscriptionActive(subscriptionId: string) {
        const subscription = await this.subscriptionRepository.findById(subscriptionId);
        if (!subscription) {
            return false;
        }

        if (subscription.status === 'cancelled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
            return false;
        }

        return true;
    }

    async buildEntitlementPayload(planId: string, overrides: EntitlementMap = {}): Promise<EntitlementMap> {
        const planEntitlements = await this.entitlementService.compilePlanEntitlements(planId);
        return { ...planEntitlements, ...overrides };
    }

    async compileLicenseEntitlementsFromSubscription(subscriptionId: string, licenseId: string): Promise<EntitlementMap> {
        const subscription = await this.subscriptionRepository.findById(subscriptionId);
        if (!subscription) {
            return {};
        }

        return this.entitlementService.compileLicenseEntitlements(subscription.planId, licenseId);
    }
}
