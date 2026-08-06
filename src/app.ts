import express from 'express';
import cors from 'cors';
import routes from './routes/index';
import { errorMiddleware } from './middleware/error.middleware';
import { requestLogger } from './middleware/logging.middleware';
import { metricsMiddleware } from './middleware/metrics.middleware';
import { metricsService } from './services/metrics.service';
import { env } from './config/env';
import { logger } from './config/logger';
import { healthHandler } from './controllers/health.controller';

const app = express();

app.disable('x-powered-by');
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
    next();
});

// Configure CORS origin list in production or use provided ALLOWED_ORIGINS
const corsOptions = {
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
        // Allow requests with no origin (server-to-server, curl, etc.)
        if (!origin) return callback(null, true);
        if (!env.allowedOrigins || env.allowedOrigins.length === 0) {
            if (env.nodeEnv === 'production') return callback(new Error('Not allowed by CORS'), false);
            return callback(null, true);
        }
        if (env.allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'), false);
    },
};
app.use(cors(corsOptions));
app.use(metricsMiddleware);
// Capture raw body for webhook HMAC verification when Stripe webhook secret is configured.
const captureRaw = Boolean(env.billingStripeWebhookSecret);
app.use(express.json({
    verify: (req: any, res, buf, encoding) => {
        if (!captureRaw) return;
        // store raw body for later HMAC verification in webhook handlers
        const enc = (encoding as unknown as BufferEncoding) || 'utf8';
        req.rawBody = buf.toString(enc);
    },
}));

// Runtime guard: log missing critical secrets in non-development environments
if (env.nodeEnv === 'production') {
    if (!env.jwtSecret) logger.error('JWT_SECRET is not set — authentication will fail');
    if (!env.ed25519PublicKey && !env.ed25519PublicKeys) logger.error('ED25519 public key(s) missing — signing verification disabled');
}
app.use(requestLogger);
// Health probe at root path for load balancers
app.get('/health', healthHandler);
app.use('/api/v1', routes);
app.get('/metrics', (_req, res) => res.json(metricsService.getMetrics()));
app.use(errorMiddleware);

export default app;
