import { Prisma } from '@prisma/client';
import prisma from '../prisma/client';

const p = prisma;

export class AdminUserRepository {
    async findByEmail(email: string) {
        return p.adminUser.findUnique({ where: { email } });
    }

    async findById(id: string) {
        return p.adminUser.findUnique({ where: { id } });
    }

    async list(opts: { page?: number; perPage?: number; search?: string; sort?: string }) {
        const page = opts.page && opts.page > 0 ? opts.page : 1;
        const perPage = opts.perPage && opts.perPage > 0 ? opts.perPage : 20;
        const where: Prisma.AdminUserWhereInput = {};
        if (opts.search) {
            where.OR = [
                { email: { contains: opts.search, mode: 'insensitive' } },
            ];
        }

        let orderBy: Prisma.AdminUserOrderByWithRelationInput = { createdAt: 'desc' };
        if (opts.sort) {
            const [field, dir] = opts.sort.split(':');
            const sortOrder = dir === 'desc' ? 'desc' : 'asc';
            if (field === 'email') orderBy = { email: sortOrder };
            else if (field === 'createdAt') orderBy = { createdAt: sortOrder };
        }

        const data = await p.adminUser.findMany({
            where,
            skip: (page - 1) * perPage,
            take: perPage,
            orderBy,
        });
        const total = await p.adminUser.count({ where });
        return { data, total, page, perPage };
    }

    async create(user: { id: string; email: string; passwordHash: string; role: string }) {
        return p.adminUser.create({ data: user });
    }

    async update(id: string, data: { email?: string; role?: string; isActive?: boolean }) {
        return p.adminUser.update({ where: { id }, data });
    }

    async disable(id: string) {
        return p.adminUser.update({ where: { id }, data: { isActive: false } });
    }

    async resetPassword(id: string, passwordHash: string) {
        return p.adminUser.update({ where: { id }, data: { passwordHash } });
    }

    async count() {
        return p.adminUser.count();
    }
}
