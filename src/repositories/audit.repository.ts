import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';

export class AuditRepository {
    async createLog(
        data: {
            licenseId?: string | null;
            deviceId?: string | null;
            ipAddress: string;
            userAgent?: string | null;
            action: string;
            isSuccess: boolean;
            failureReason?: string | null;
        },
        tx: Prisma.TransactionClient | typeof prisma = prisma,
    ) {
        return tx.activationLog.create({
            data,
        });
    }
}
