import { Prisma } from '@prisma/client';
import { AuditRepository } from '../repositories/audit.repository';

export class AuditService {
    private repository = new AuditRepository();

    async logEvent(
        data: {
            licenseId?: string | null;
            deviceId?: string | null;
            ipAddress: string;
            userAgent?: string | null;
            action: string;
            isSuccess: boolean;
            failureReason?: string | null;
        },
        tx?: Prisma.TransactionClient,
    ) {
        return this.repository.createLog(data, tx);
    }
}
