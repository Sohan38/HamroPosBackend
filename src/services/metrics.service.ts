export class MetricsService {
    private requestCount = 0;
    private errorCount = 0;
    private totalResponseTimeMs = 0;
    private endpointCounts: Record<string, number> = {};

    recordRequest(path: string, durationMs: number) {
        this.requestCount += 1;
        this.totalResponseTimeMs += durationMs;
        this.endpointCounts[path] = (this.endpointCounts[path] ?? 0) + 1;
    }

    recordError() {
        this.errorCount += 1;
    }

    getMetrics() {
        const averageResponseTimeMs = this.requestCount > 0 ? this.totalResponseTimeMs / this.requestCount : 0;

        return {
            timestamp: new Date().toISOString(),
            uptimeSeconds: process.uptime(),
            memoryUsage: process.memoryUsage(),
            requestsTotal: this.requestCount,
            errorsTotal: this.errorCount,
            averageResponseTimeMs,
            endpointCounts: this.endpointCounts,
        };
    }
}

export const metricsService = new MetricsService();
