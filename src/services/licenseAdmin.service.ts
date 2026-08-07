import crypto from 'crypto';
import { LicenseRepository } from '../repositories/license.repository';
import { EntitlementService } from './entitlement.service';
import { CryptoService } from './crypto.service';
import { generateActivationKey } from '../crypto/activationKey';
import { OrganizationRepository } from '../repositories/organization.repository';
import { PlanRepository } from '../repositories/plan.repository';
import { SubscriptionRepository } from '../repositories/subscription.repository';

export type LicenseOverrideInput = {
    featureId: string;
    valueType: 'boolean' | 'numeric';
    booleanValue?: boolean | null;
    numericValue?: number | null;
};

export class LicenseAdminService {
    private licenseRepository = new LicenseRepository();
    private entitlementService = new EntitlementService();
    private cryptoService = new CryptoService();
    private organizationRepository = new OrganizationRepository();
    private planRepository = new PlanRepository();
    private subscriptionRepository = new SubscriptionRepository();

    async createLicense(params: {
        id?: string;
        subscriptionId?: string;
        organizationName?: string;
        planName?: string;
        status?: string;
        expiresAt?: Date | null;
        maxDevicesOverride?: number | null;
        overrides?: LicenseOverrideInput[];
    }) {
        const id = params.id ?? crypto.randomUUID();
        let subscriptionId = params.subscriptionId;

        if (!subscriptionId) {
            if (!params.organizationName || !params.planName) {
                throw new Error('subscriptionId or organizationName and planName are required');
            }

            const organizationName = params.organizationName.trim();
            let organization = await this.organizationRepository.findByName(organizationName);
            if (!organization) {
                organization = await this.organizationRepository.create({
                    id: crypto.randomUUID(),
                    name: organizationName,
                });
            }

            const plan = await this.planRepository.findByName(params.planName.trim());
            if (!plan) {
                throw new Error(`Plan not found: ${params.planName}`);
            }

            const startsAt = new Date();
            const expiresAt = params.expiresAt ?? new Date(startsAt.getTime() + 365 * 24 * 60 * 60 * 1000);

            const subscription = await this.subscriptionRepository.create({
                id: crypto.randomUUID(),
                organizationId: organization.id,
                planId: plan.id,
                status: 'active',
                isLifetime: false,
                startsAt,
                expiresAt,
                gracePeriodDays: 7,
            });

            subscriptionId = subscription.id;
        }

        const activationKey = generateActivationKey();
        const activationKeyLookup = this.cryptoService.createLookupHash(activationKey);
        const activationKeyVerify = await this.cryptoService.hashKey(activationKey);

        const license = await this.licenseRepository.create({
            id,
            subscriptionId,
            activationKeyLookup,
            activationKeyVerify,
            status: params.status ?? 'active',
            maxDevicesOverride: params.maxDevicesOverride ?? null,
        });

        if (params.overrides && params.overrides.length > 0) {
            await this.entitlementService.saveLicenseOverrides(license.id, params.overrides);
        }

        const { activationKeyVerify: _, ...safeLicense } = license;
        return { license: safeLicense, activationKey };
    }
}
