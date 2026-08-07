import prisma from '../prisma/client';
import { logger } from '../config/logger';
import { maskActivationKey } from '../utils/mask';
import { ApiError } from '../utils/errors';
import { LicenseRepository } from '../repositories/license.repository';
import { DeviceRepository } from '../repositories/device.repository';
import { AuditService } from './audit.service';
import { CryptoService } from './crypto.service';
import { EntitlementService } from './entitlement.service';
import { LicenseActivationPayloadService } from './licenseActivationPayload.service';

export class ActivationService {
    private licenseRepository = new LicenseRepository();
    private deviceRepository = new DeviceRepository();
    private auditService = new AuditService();
    private cryptoService = new CryptoService();
    private entitlementService = new EntitlementService();
    private payloadService = new LicenseActivationPayloadService();

    private getPlanDeviceLimit(license: any): number {
        if (license.maxDevicesOverride !== null && license.maxDevicesOverride !== undefined) {
            return license.maxDevicesOverride;
        }

        return license.subscription?.plan?.maxDevices ?? 1;
    }

    private normalizeActivationKey(key: string): string {
        return key.trim().toUpperCase();
    }

    private looksLikeActivationKeyLookupHash(key: string): boolean {
        return /^[A-F0-9]{64}$/.test(key.trim().toUpperCase());
    }

    private looksLikeFormattedActivationKey(key: string): boolean {
        return /^[A-F0-9]{4}(?:-[A-F0-9]{4}){4}$/.test(key.trim().toUpperCase());
    }

    private async ensureLicenseAndSubscription(license: any, deviceId: string, ipAddress: string, userAgent?: string | null) {
        if (!license) {
            logger.warn('License activation failed: invalid activation key in ensureLicenseAndSubscription', {
                deviceId,
                ipAddress,
                userAgent,
            });
            await this.auditService.logEvent({
                licenseId: null,
                ipAddress,
                userAgent,
                action: 'activate',
                isSuccess: false,
                failureReason: 'INVALID_ACTIVATION_KEY',
            });
            throw new ApiError('INVALID_ACTIVATION_KEY', 'Invalid activation key.');
        }

        if (license.status !== 'active') {
            await this.auditService.logEvent({
                licenseId: license.id,
                ipAddress,
                userAgent,
                action: 'activate',
                isSuccess: false,
                failureReason: 'LICENSE_SUSPENDED',
            });
            throw new ApiError('LICENSE_SUSPENDED', 'License is suspended.');
        }

        const subscription = license.subscription;
        if (!subscription) {
            throw new ApiError('LICENSE_NOT_FOUND', 'License subscription missing.');
        }

        if (subscription.status === 'cancelled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
            throw new ApiError('LICENSE_SUSPENDED', 'Subscription is suspended or unpaid.');
        }

        const now = new Date();
        if (!subscription.isLifetime && subscription.expiresAt && subscription.expiresAt < now) {
            throw new ApiError('LICENSE_EXPIRED', 'License subscription has expired.');
        }

        return license;
    }

    async activateLicense(params: {
        activationKey: string;
        deviceId: string;
        deviceMeta: {
            platform: string;
            manufacturer?: string | null;
            model?: string | null;
            appVersion: string;
        };
        ipAddress: string;
        userAgent?: string | null;
    }) {
        const lookupHash = this.cryptoService.createLookupHash(params.activationKey);
        const normalizedKey = this.normalizeActivationKey(params.activationKey);
        const formattedKey = this.cryptoService.formatActivationKey(normalizedKey);
        const looksLikeLookupHash = this.looksLikeActivationKeyLookupHash(params.activationKey);
        const looksLikeFormattedKey = this.looksLikeFormattedActivationKey(params.activationKey);

        logger.info('License activation attempt for key', maskActivationKey(params.activationKey), 'device', params.deviceId);
        const license = await this.licenseRepository.findByActivationKeyLookup(lookupHash);

        if (!license) {
            logger.warn('License activation failed: invalid activation key lookup', {
                receivedKey: params.activationKey,
                normalizedKey: normalizedKey,
                expectedKeyFormat: formattedKey,
                lookupHash,
                looksLikeLookupHash,
                looksLikeFormattedKey,
                deviceId: params.deviceId,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                reason: 'no license matched activationKeyLookup',
                note: 'activation key lookup hash did not match any stored license',
            });
            await this.auditService.logEvent({
                licenseId: null,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                action: 'activate',
                isSuccess: false,
                failureReason: 'INVALID_ACTIVATION_KEY',
            });
            throw new ApiError('INVALID_ACTIVATION_KEY', 'Invalid activation key.');
        }

        const validKey = await this.cryptoService.verifyKey(params.activationKey, license.activationKeyVerify);
        if (!validKey) {
            logger.warn('License activation failed: invalid activation key verification', {
                receivedKey: params.activationKey,
                normalizedKey: normalizedKey,
                expectedKeyFormat: formattedKey,
                licenseId: license.id,
                licenseStatus: license.status,
                storedActivationKeyLookup: license.activationKeyLookup,
                lookupHash,
                activationKeyVerifyPresent: Boolean(license.activationKeyVerify),
                deviceId: params.deviceId,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                reason: 'activation key did not verify against stored activationKeyVerify',
            });
            await this.auditService.logEvent({
                licenseId: license.id,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                action: 'activate',
                isSuccess: false,
                failureReason: 'INVALID_ACTIVATION_KEY',
            });
            throw new ApiError('INVALID_ACTIVATION_KEY', 'Invalid activation key.');
        }

        await this.ensureLicenseAndSubscription(license, params.deviceId, params.ipAddress, params.userAgent);

        const existingDevice = await this.deviceRepository.findByLicenseIdAndDeviceId(license.id, params.deviceId);
        const activeDeviceCount = await this.deviceRepository.countByLicenseId(license.id);
        const maxDevices = this.getPlanDeviceLimit(license);

        if (!existingDevice && activeDeviceCount >= maxDevices) {
            await this.auditService.logEvent({
                licenseId: license.id,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                action: 'activate',
                isSuccess: false,
                failureReason: 'DEVICE_LIMIT_REACHED',
            });
            throw new ApiError('DEVICE_LIMIT_REACHED', 'Device limit reached for this license.');
        }

        await prisma.$transaction(async (tx) => {
            await tx.device.upsert({
                where: { id: params.deviceId },
                create: {
                    id: params.deviceId,
                    licenseId: license.id,
                    platform: params.deviceMeta.platform,
                    manufacturer: params.deviceMeta.manufacturer ?? null,
                    model: params.deviceMeta.model ?? null,
                    appVersion: params.deviceMeta.appVersion,
                },
                update: {
                    licenseId: license.id,
                    platform: params.deviceMeta.platform,
                    manufacturer: params.deviceMeta.manufacturer ?? null,
                    model: params.deviceMeta.model ?? null,
                    appVersion: params.deviceMeta.appVersion,
                    lastSeenAt: new Date(),
                },
            });

            await tx.activationLog.create({
                data: {
                    licenseId: license.id,
                    deviceId: params.deviceId,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                    action: 'activate',
                    isSuccess: true,
                },
            });
        });

        const devices = await this.deviceRepository.listByLicenseId(license.id);
        const entitlements = await this.entitlementService.compileLicenseEntitlements(license.subscription.planId, license.id);
        const payload = this.payloadService.createPayload({
            licenseId: license.id,
            businessName: license.subscription.organization.name,
            plan: license.subscription.planId,
            expiresAt: license.subscription.expiresAt,
            gracePeriodDays: license.subscription.gracePeriodDays,
            entitlements,
            authorizedDevices: devices.map((device) => device.id),
        });

        if (!this.cryptoService.isSigningEnabled()) {
            await this.auditService.logEvent({
                licenseId: license.id,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                action: 'activate',
                isSuccess: false,
                failureReason: 'SIGNING_DISABLED',
            });
            throw new ApiError('SIGNING_DISABLED', 'Server signing is not configured.');
        }

        return {
            payload,
            signature: this.cryptoService.signPayload(JSON.stringify(payload)),
        };
    }

    async verifyLicense(params: { licenseId: string; deviceId: string; ipAddress: string; userAgent?: string | null }) {
        const license = await this.licenseRepository.findById(params.licenseId);
        if (!license) {
            throw new ApiError('LICENSE_NOT_FOUND', 'License not found.');
        }

        if (license.status !== 'active') {
            throw new ApiError('LICENSE_SUSPENDED', 'License is suspended.');
        }

        const subscription = license.subscription;
        if (!subscription) {
            throw new ApiError('LICENSE_NOT_FOUND', 'License subscription missing.');
        }

        if (subscription.status === 'cancelled' || subscription.status === 'unpaid' || subscription.status === 'past_due') {
            throw new ApiError('LICENSE_SUSPENDED', 'Subscription is suspended or unpaid.');
        }

        const now = new Date();
        if (!subscription.isLifetime && subscription.expiresAt && subscription.expiresAt < now) {
            throw new ApiError('LICENSE_EXPIRED', 'License subscription has expired.');
        }

        await prisma.$transaction(async (tx) => {
            await tx.device.upsert({
                where: { id: params.deviceId },
                create: {
                    id: params.deviceId,
                    licenseId: license.id,
                    platform: 'desktop',
                    manufacturer: null,
                    model: null,
                    appVersion: 'unknown',
                },
                update: {
                    licenseId: license.id,
                    platform: 'desktop',
                    manufacturer: null,
                    model: null,
                    appVersion: 'unknown',
                    lastSeenAt: new Date(),
                },
            });

            await tx.activationLog.create({
                data: {
                    licenseId: license.id,
                    deviceId: params.deviceId,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                    action: 'verify',
                    isSuccess: true,
                },
            });
        });

        const devices = await this.deviceRepository.listByLicenseId(license.id);
        const entitlements = await this.entitlementService.compileLicenseEntitlements(subscription.planId, license.id);
        const payload = this.payloadService.createPayload({
            licenseId: license.id,
            businessName: subscription.organization.name,
            plan: subscription.planId,
            expiresAt: subscription.expiresAt,
            gracePeriodDays: subscription.gracePeriodDays,
            entitlements,
            authorizedDevices: devices.map((device) => device.id),
        });

        if (!this.cryptoService.isSigningEnabled()) {
            await this.auditService.logEvent({
                licenseId: license.id,
                deviceId: params.deviceId,
                ipAddress: params.ipAddress,
                userAgent: params.userAgent,
                action: 'verify',
                isSuccess: false,
                failureReason: 'SIGNING_DISABLED',
            });
            throw new ApiError('SIGNING_DISABLED', 'Server signing is not configured.');
        }

        return {
            payload,
            signature: this.cryptoService.signPayload(JSON.stringify(payload)),
        };
    }

    async resetDevices(params: { activationKey: string; deviceId: string; ipAddress: string; userAgent?: string | null }) {
        const lookupHash = this.cryptoService.createLookupHash(params.activationKey);
        const license = await this.licenseRepository.findByActivationKeyLookup(lookupHash);

        if (!license) {
            throw new ApiError('INVALID_ACTIVATION_KEY', 'Invalid activation key.');
        }

        await prisma.$transaction(async (tx) => {
            await tx.device.deleteMany({
                where: { licenseId: license.id },
            });
            await tx.activationLog.create({
                data: {
                    licenseId: license.id,
                    deviceId: params.deviceId,
                    ipAddress: params.ipAddress,
                    userAgent: params.userAgent,
                    action: 'reset',
                    isSuccess: true,
                },
            });
        });

        return { success: true };
    }
}
