import { FeatureRepository } from '../repositories/feature.repository';
import { generateId } from '../utils/id';

export class FeatureService {
    private repository = new FeatureRepository();

    async listFeatures() {
        return this.repository.findAll();
    }

    async createFeature(feature: { id?: string; name: string; valueType: 'boolean' | 'numeric'; description?: string | null }) {
        const id = feature.id ?? generateId(feature.name);
        return this.repository.create({ ...feature, id });
    }
}
