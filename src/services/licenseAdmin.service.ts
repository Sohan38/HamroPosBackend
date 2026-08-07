import crypto from 'crypto';
import { LicenseRepository } from '../repositories/license.repository';
import { EntitlementService } from './entitlement.service';
import { CryptoService } from './crypto.service';
import { generateActivationKey } from '../crypto/activationKey';

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

    async createLicense(params: {
        id?: string;
        subscriptionId: string;
        status?: string;
        maxDevicesOverride?: number | null;
        overrides?: LicenseOverrideInput[];
    }) {
        const id = params.id ?? crypto.randomUUID();
        const activationKey = generateActivationKey();
        const activationKeyLookup = this.cryptoService.createLookupHash(activationKey);
        const activationKeyVerify = await this.cryptoService.hashKey(activationKey);

        const license = await this.licenseRepository.create({
            id,
            subscriptionId: params.subscriptionId,
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
