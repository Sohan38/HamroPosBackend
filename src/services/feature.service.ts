import { FeatureRepository } from '../repositories/feature.repository';

export class FeatureService {
    private repository = new FeatureRepository();

    async listFeatures() {
        return this.repository.findAll();
    }

    async createFeature(feature: { id: string; name: string; valueType: 'boolean' | 'numeric'; description?: string | null }) {
        return this.repository.create(feature);
    }
}
