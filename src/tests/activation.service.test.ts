import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ActivationService } from '../services/activation.service';

const mockLicense = {
    id: 'license-123',
    activationKeyVerify: 'hashed-key',
    status: 'active',
    maxDevicesOverride: null,
    subscription: {
        planId: 'plan-123',
        organization: { name: 'Test Org' },
        plan: { maxDevices: 2, id: 'plan-123' },
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        gracePeriodDays: 7,
        isLifetime: false,
        status: 'active',
    },
};
const mockDevice = { id: 'device-123' };

vi.mock('../repositories/license.repository', () => ({
    LicenseRepository: vi.fn().mockImplementation(function () {
        return {
            findByActivationKeyLookup: vi.fn(async () => mockLicense),
            findById: vi.fn(async () => mockLicense),
        };
    }),
}));

vi.mock('../repositories/device.repository', () => ({
    DeviceRepository: vi.fn().mockImplementation(function () {
        return {
            findByLicenseIdAndDeviceId: vi.fn(async () => null),
            countByLicenseId: vi.fn(async () => 0),
            listByLicenseId: vi.fn(async () => [mockDevice]),
            upsertDevice: vi.fn(async () => mockDevice),
            deleteByLicenseId: vi.fn(async () => ({ count: 0 })),
        };
    }),
}));

vi.mock('../services/audit.service', () => ({
    AuditService: vi.fn().mockImplementation(function () {
        return {
            logEvent: vi.fn(async () => undefined),
        };
    }),
}));

vi.mock('../services/crypto.service', () => ({
    CryptoService: vi.fn().mockImplementation(function () {
        return {
            createLookupHash: vi.fn(() => 'lookup-hash'),
            verifyKey: vi.fn(async () => true),
            isSigningEnabled: vi.fn(() => true),
            signPayload: vi.fn(() => 'signed-payload'),
        };
    }),
}));

vi.mock('../services/entitlement.service', () => ({
    EntitlementService: vi.fn().mockImplementation(function () {
        return {
            compileLicenseEntitlements: vi.fn(async () => ({ featureA: true })),
        };
    }),
}));

vi.mock('../services/licenseActivationPayload.service', () => ({
    LicenseActivationPayloadService: vi.fn().mockImplementation(function () {
        return {
            createPayload: vi.fn((payload: any) => ({ ...payload, createdAt: 'now' })),
        };
    }),
}));

vi.mock('../prisma/client', () => ({
    default: {
        $transaction: vi.fn(async (cb: any) => cb({
            device: {
                upsert: vi.fn(async () => mockDevice),
            },
            activationLog: {
                create: vi.fn(async () => undefined),
            },
        })),
    },
}));

describe('ActivationService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('activates a license and returns signed payload', async () => {
        const service = new ActivationService();
        const result = await service.activateLicense({
            activationKey: 'TEST-KEY',
            deviceId: 'device-123',
            deviceMeta: {
                platform: 'desktop',
                manufacturer: 'TestCo',
                model: 'Model-X',
                appVersion: '1.0.0',
            },
            ipAddress: '127.0.0.1',
            userAgent: 'vitest',
        });

        expect(result).toBeDefined();
        expect(result.signature).toBe('signed-payload');
        expect(result.payload.licenseId).toBe('license-123');
        expect(result.payload.authorizedDevices).toEqual(['device-123']);
    });
});
