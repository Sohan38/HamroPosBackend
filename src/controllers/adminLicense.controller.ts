import { Request, Response, NextFunction } from 'express';
import prisma from '../prisma/client';
import { createResponse } from '../utils/apiResponse';
import { LicenseRepository } from '../repositories/license.repository';
import { DeviceRepository } from '../repositories/device.repository';
import { LicenseAdminService } from '../services/licenseAdmin.service';
import { EntitlementService } from '../services/entitlement.service';

const repo = new LicenseRepository();
const deviceRepository = new DeviceRepository();
const licenseAdminService = new LicenseAdminService();
const entitlementService = new EntitlementService();

function mapLicenseListItem(item: any, deviceCount: number) {
    return {
        id: item.id,
        activationKeyLookup: item.activationKeyLookup,
        status: item.status,
        organizationName: item.subscription?.organization?.name ?? "",
        planName: item.subscription?.plan?.name ?? "",
        deviceCount,
        maxDevices: item.maxDevicesOverride ?? item.subscription?.plan?.maxDevices ?? 1,
        createdAt: item.createdAt.toISOString(),
        expiresAt: item.subscription?.expiresAt?.toISOString() ?? "",
    };
}

function mapLicenseDetail(item: any, devices: any[], activationLogs: any[], entitlements: any[]) {
    return {
        id: item.id,
        activationKeyLookup: item.activationKeyLookup,
        status: item.status,
        organizationName: item.subscription?.organization?.name ?? "",
        planName: item.subscription?.plan?.name ?? "",
        devices,
        activationLogs,
        entitlements,
        deviceCount: devices.length,
        maxDevices: item.maxDevicesOverride ?? item.subscription?.plan?.maxDevices ?? 1,
        createdAt: item.createdAt.toISOString(),
        expiresAt: item.subscription?.expiresAt?.toISOString() ?? "",
    };
}

export class LicenseAdminController {
    async list(req: Request, res: Response, next: NextFunction) {
        try {
            const items = await repo.findAll();
            const payload = await Promise.all(
                items.map(async (item) => {
                    const deviceCount = await deviceRepository.countByLicenseId(item.id);
                    return mapLicenseListItem(item, deviceCount);
                }),
            );
            return res.status(200).json(createResponse(payload));
        } catch (err) {
            next(err);
        }
    }

    async get(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await repo.findById(req.params.id);
            if (!item) return res.status(404).json(createResponse(null, [{ code: 'NOT_FOUND', message: 'License not found' }]));

            const devices = await deviceRepository.listByLicenseId(item.id);
            const activationLogs = await prisma.activationLog.findMany({
                where: { licenseId: item.id },
                orderBy: { createdAt: 'desc' },
            });
            const entitlementMap = await entitlementService.compileLicenseEntitlements(item.subscription.planId, item.id);
            const entitlements = Object.entries(entitlementMap).map(([key, value]) => ({
                key,
                label: key,
                value: String(value),
            }));

            return res.status(200).json(createResponse(mapLicenseDetail(item, devices, activationLogs, entitlements)));
        } catch (err) {
            next(err);
        }
    }

    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { id, subscriptionId, organizationName, planName, status, expiresAt, maxDevicesOverride, overrides } = req.body;
            const result = await licenseAdminService.createLicense({
                id,
                subscriptionId,
                organizationName,
                planName,
                status,
                expiresAt: expiresAt ? new Date(expiresAt) : undefined,
                maxDevicesOverride,
                overrides,
            });
            return res.status(201).json(createResponse(result));
        } catch (err) {
            next(err);
        }
    }

    async update(req: Request, res: Response, next: NextFunction) {
        try {
            const item = await repo.update(req.params.id, req.body);
            return res.status(200).json(createResponse(item));
        } catch (err) {
            next(err);
        }
    }

    async remove(req: Request, res: Response, next: NextFunction) {
        try {
            await repo.delete(req.params.id);
            return res.status(204).send();
        } catch (err) {
            next(err);
        }
    }
}
