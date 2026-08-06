import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';

export class DeviceRepository {
    async findByLicenseIdAndDeviceId(licenseId: string, deviceId: string, tx: Prisma.TransactionClient | typeof prisma = prisma) {
        return tx.device.findFirst({
            where: {
                id: deviceId,
                licenseId,
            },
        });
    }

    async countByLicenseId(licenseId: string, tx: Prisma.TransactionClient | typeof prisma = prisma) {
        return tx.device.count({
            where: { licenseId },
        });
    }

    async listByLicenseId(licenseId: string, tx: Prisma.TransactionClient | typeof prisma = prisma) {
        return tx.device.findMany({
            where: { licenseId },
        });
    }

    async deleteByLicenseId(licenseId: string, tx: Prisma.TransactionClient | typeof prisma = prisma) {
        return tx.device.deleteMany({
            where: { licenseId },
        });
    }

    async upsertDevice(
        params: {
            licenseId: string;
            deviceId: string;
            platform: string;
            manufacturer?: string | null;
            model?: string | null;
            appVersion: string;
        },
        tx: Prisma.TransactionClient | typeof prisma = prisma,
    ) {
        const { licenseId, deviceId, platform, manufacturer, model, appVersion } = params;
        return tx.device.upsert({
            where: { id: deviceId },
            create: {
                id: deviceId,
                licenseId,
                platform,
                manufacturer,
                model,
                appVersion,
            },
            update: {
                licenseId,
                platform,
                manufacturer,
                model,
                appVersion,
                lastSeenAt: new Date(),
            },
        });
    }
}
