import dotenv from 'dotenv';

dotenv.config();

export const env = {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 4000),
    databaseUrl: process.env.DATABASE_URL ?? '',
    serverPepper: process.env.SERVER_PEPPER ?? '',
    ed25519PrivateKey: process.env.ED25519_PRIVATE_KEY ?? '',
    ed25519PublicKey: process.env.ED25519_PUBLIC_KEY ?? '',
    // Optional comma or newline-separated list for public key rotation
    ed25519PublicKeys: process.env.ED25519_PUBLIC_KEYS ?? '',
    adminApiKey: process.env.ADMIN_API_KEY ?? '',
    jwtSecret: process.env.JWT_SECRET ?? '',
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1h',
    rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS ?? 3600000),
    rateLimitMax: Number(process.env.RATE_LIMIT_MAX ?? 5),
    enableAdminBootstrap: (process.env.ENABLE_ADMIN_BOOTSTRAP ?? 'false').toLowerCase() === 'true',
    billingWebhookSecret: process.env.BILLING_WEBHOOK_SECRET ?? '',
    billingProvider: process.env.BILLING_PROVIDER ?? 'generic',
    billingStripeWebhookSecret: process.env.BILLING_STRIPE_WEBHOOK_SECRET ?? '',
    allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '').split(',').map(s => s.trim()).filter(Boolean),
};

export const validateConfig = () => {
    const missing: string[] = [];

    if (env.nodeEnv === 'production') {
        if (!env.databaseUrl) missing.push('DATABASE_URL');
        if (!env.jwtSecret) missing.push('JWT_SECRET');
        if (!env.allowedOrigins || env.allowedOrigins.length === 0) missing.push('ALLOWED_ORIGINS');
        if (!env.ed25519PrivateKey) missing.push('ED25519_PRIVATE_KEY');
        if (!env.ed25519PublicKey && !env.ed25519PublicKeys) missing.push('ED25519_PUBLIC_KEY or ED25519_PUBLIC_KEYS');
        if (env.enableAdminBootstrap && !env.adminApiKey) missing.push('ADMIN_API_KEY (required when ENABLE_ADMIN_BOOTSTRAP=true)');
    }

    if (missing.length > 0) {
        throw new Error(`Missing required environment variables for production: ${missing.join(', ')}`);
    }
};
