import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';

export class AdminAuditRepository {
    async create(data: {
        adminId: string;
        targetAdminId?: string | null;
        action: string;
        details?: string | null;
        isSuccess?: boolean;
        ipAddress?: string | null;
        userAgent?: string | null;
    }) {
        return prisma.adminAudit.create({ data });
    }

    async list(opts: { adminId?: string; action?: string; from?: Date; to?: Date; page?: number; perPage?: number }) {
        const page = opts.page && opts.page > 0 ? opts.page : 1;
        const perPage = opts.perPage && opts.perPage > 0 ? opts.perPage : 20;
        const where: Prisma.AdminAuditWhereInput = {};
        if (opts.adminId) where.adminId = opts.adminId;
        if (opts.action) where.action = opts.action;
        if (opts.from || opts.to) {
            where.createdAt = {};
            if (opts.from) where.createdAt.gte = opts.from;
            if (opts.to) where.createdAt.lte = opts.to;
        }

        const data = await prisma.adminAudit.findMany({ where, skip: (page - 1) * perPage, take: perPage, orderBy: { createdAt: 'desc' } });
        const total = await prisma.adminAudit.count({ where });
        return { data, total, page, perPage };
    }
}
