import { randomUUID } from 'crypto';
import { AdminUserRepository } from '../repositories/adminUser.repository';
import { hashActivationKey, verifyActivationKey } from '../crypto/hashing';

const normalizeRole = (role: string) => role?.toLowerCase() === 'superadmin' ? 'superadmin' : 'admin';

export class AdminUserService {
    private repo = new AdminUserRepository();

    async findByEmail(email: string) {
        return this.repo.findByEmail(email);
    }

    async findById(id: string) {
        return this.repo.findById(id);
    }

    async createAdmin(email: string, password: string, role = 'admin') {
        const id = randomUUID();
        const passwordHash = await hashActivationKey(password);
        return this.repo.create({ id, email, passwordHash, role: normalizeRole(role) });
    }

    async updateAdmin(id: string, data: { email?: string; role?: string; disabled?: boolean }) {
        const update: { email?: string; role?: string; isActive?: boolean } = {};
        if (data.email) update.email = data.email;
        if (data.role) update.role = normalizeRole(data.role);
        if (typeof data.disabled === 'boolean') update.isActive = !data.disabled;
        return this.repo.update(id, update);
    }

    async disableAdmin(id: string) {
        return this.repo.disable(id);
    }

    async resetPassword(id: string, password: string) {
        const passwordHash = await hashActivationKey(password);
        return this.repo.resetPassword(id, passwordHash);
    }

    async verifyCredentials(email: string, password: string) {
        const user = await this.repo.findByEmail(email);
        if (!user || !user.passwordHash) return null;
        const ok = await verifyActivationKey(password, user.passwordHash);
        return ok ? user : null;
    }

    async countUsers() {
        return this.repo.count();
    }

    async listAdmins(opts: { page?: number; perPage?: number; search?: string; sort?: string }) {
        return this.repo.list(opts);
    }
}
