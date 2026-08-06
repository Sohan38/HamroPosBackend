import { AdminAuditRepository } from '../repositories/adminAudit.repository';

export class AdminAuditService {
    private repo = new AdminAuditRepository();

    async logAdminAction(params: {
        adminId: string;
        targetAdminId?: string | null;
        action: string;
        details?: string | null;
        isSuccess?: boolean;
        ipAddress?: string | null;
        userAgent?: string | null;
    }) {
        return this.repo.create({
            adminId: params.adminId,
            targetAdminId: params.targetAdminId ?? null,
            action: params.action,
            details: params.details ?? null,
            isSuccess: params.isSuccess ?? true,
            ipAddress: params.ipAddress ?? null,
            userAgent: params.userAgent ?? null,
        });
    }

    async listAudits(opts: { adminId?: string; action?: string; from?: Date; to?: Date; page?: number; perPage?: number }) {
        return this.repo.list(opts);
    }
}
