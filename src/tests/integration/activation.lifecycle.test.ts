import { describe, it, beforeEach, expect, vi } from 'vitest';
import { ActivationService } from '../../services/activation.service';

// This integration-style test suite uses repository/service mocks to exercise the
// activation lifecycle: create-license -> activate -> verify -> reset -> failure modes.

const mockLicense = {
    id: 'license-abc',
    activationKeyVerify: 'hashed-key',
    status: 'active',
    maxDevicesOverride: null,
    subscription: {
        planId: 'plan-1',
        organization: { name: 'TestOrg' },
        plan: { maxDevices: 2, id: 'plan-1' },
        expiresAt: new Date(Date.now() + 3600 * 1000),
        gracePeriodDays: 7,
        isLifetime: false,
        status: 'active',
    },
};

const mockDevice = { id: 'device-1' };

vi.mock('../../repositories/license.repository', () => ({
    LicenseRepository: vi.fn().mockImplementation(function () {
        return {
            findByActivationKeyLookup: vi.fn(async () => mockLicense),
            findById: vi.fn(async () => mockLicense),
            create: vi.fn(async (data: any) => data),
        };
    }),
}));

vi.mock('../../repositories/device.repository', () => ({
    DeviceRepository: vi.fn().mockImplementation(function () {
        return {
            findByLicenseIdAndDeviceId: vi.fn(async () => null),
            countByLicenseId: vi.fn(async () => 0),
            listByLicenseId: vi.fn(async () => [mockDevice]),
            upsertDevice: vi.fn(async () => mockDevice),
            deleteByLicenseId: vi.fn(async () => ({ count: 1 })),
        };
    }),
}));

vi.mock('../../services/audit.service', () => ({
    AuditService: vi.fn().mockImplementation(function () {
        return { logEvent: vi.fn(async () => undefined) };
    }),
}));

vi.mock('../../services/crypto.service', () => ({
    CryptoService: vi.fn().mockImplementation(function () {
        return {
            createLookupHash: vi.fn(() => 'lookup'),
            verifyKey: vi.fn(async () => true),
            signPayload: vi.fn(() => 'signed-payload'),
            isSigningEnabled: vi.fn(() => true),
            getPublicKeys: vi.fn(() => ['pub1', 'pub2']),
        };
    }),
}));

vi.mock('../../services/entitlement.service', () => ({
    EntitlementService: vi.fn().mockImplementation(function () {
        return { compileLicenseEntitlements: vi.fn(async () => ({ f: true })) };
    }),
}));

vi.mock('../../services/licenseActivationPayload.service', () => ({
    LicenseActivationPayloadService: vi.fn().mockImplementation(function () {
        return { createPayload: vi.fn((p: any) => ({ ...p, createdAt: 'now' })) };
    }),
}));

vi.mock('../../prisma/client', () => ({
    default: {
        $transaction: vi.fn(async (cb: any) =>
            cb({
                device: {
                    upsert: vi.fn(async () => mockDevice),
                    deleteMany: vi.fn(async () => ({ count: 1 })),
                },
                activationLog: {
                    create: vi.fn(async () => ({})),
                },
            })
        ),
    },
}));

describe('Activation lifecycle (integration-style)', () => {
    beforeEach(() => vi.clearAllMocks());

    it('full activation -> verify -> reset flow', async () => {
        const svc = new ActivationService();

        const activation = await svc.activateLicense({
            activationKey: 'KEY',
            deviceId: 'device-1',
            deviceMeta: { platform: 'desktop', appVersion: '1.0.0' },
            ipAddress: '127.0.0.1',
            userAgent: 'vitest',
        });

        expect(activation).toBeDefined();
        expect(activation.signature).toBe('signed-payload');

        const verification = await svc.verifyLicense({ licenseId: 'license-abc', deviceId: 'device-1', ipAddress: '127.0.0.1' });
        expect(verification).toBeDefined();
        expect(verification.signature).toBe('signed-payload');

        const reset = await svc.resetDevices({ activationKey: 'KEY', deviceId: 'device-1', ipAddress: '127.0.0.1' });
        expect(reset.success).toBe(true);
    });

    it('fails activation if signing disabled', async () => {
        // override CryptoService mock to report signing disabled
        const crypto = await import('../../services/crypto.service');
        crypto.CryptoService = vi.fn().mockImplementation(function () {
            return {
                createLookupHash: () => 'lookup',
                verifyKey: async () => true,
                isSigningEnabled: () => false,
                signPayload: () => {
                    throw new Error('should not sign');
                },
            };
        });

        const svc = new ActivationService();
        await expect(
            svc.activateLicense({ activationKey: 'KEY', deviceId: 'd', deviceMeta: { platform: 'x', appVersion: '1' }, ipAddress: 'ip', userAgent: null })
        ).rejects.toMatchObject({ code: 'SIGNING_DISABLED' });
    });
});
