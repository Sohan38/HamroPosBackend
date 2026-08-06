import { EntitlementMap } from '../types';

export interface LicenseActivationPayload {
    version: number;
    licenseId: string;
    businessName: string;
    plan: string;
    expiresAt: string | null;
    gracePeriodDays: number;
    entitlements: EntitlementMap;
    authorizedDevices: string[];
    issuedAt: string;
}

export class LicenseActivationPayloadService {
    createPayload(params: {
        licenseId: string;
        businessName: string;
        plan: string;
        expiresAt: Date | null;
        gracePeriodDays: number;
        entitlements: EntitlementMap;
        authorizedDevices: string[];
    }): LicenseActivationPayload {
        return {
            version: 1,
            licenseId: params.licenseId,
            businessName: params.businessName,
            plan: params.plan,
            expiresAt: params.expiresAt ? params.expiresAt.toISOString() : null,
            gracePeriodDays: params.gracePeriodDays,
            entitlements: params.entitlements,
            authorizedDevices: params.authorizedDevices,
            issuedAt: new Date().toISOString(),
        };
    }
}
