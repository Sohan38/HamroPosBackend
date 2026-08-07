import { PlanRepository } from '../repositories/plan.repository';
import { generateId } from '../utils/id';

export class PlanService {
    private repo = new PlanRepository();

    async listPlans() {
        return this.repo.findAll();
    }

    async getPlan(id: string) {
        return this.repo.findById(id);
    }

    async createPlan(data: { id?: string; name: string; maxDevices?: number | null; price?: number | null; description?: string | null }) {
        const id = data.id ?? generateId(data.name);
        return this.repo.create({ ...data, id });
    }

    async updatePlan(id: string, data: { name?: string; maxDevices?: number | null; price?: number | null; description?: string | null }) {
        return this.repo.update(id, data);
    }

    async deletePlan(id: string) {
        return this.repo.delete(id);
    }
}
