import { Request, Response } from 'express';
import prisma from '../prisma/client';
import { env } from '../config/env';

export const healthHandler = async (req: Request, res: Response) => {
    const components: Record<string, any> = {};
    let overall = 'healthy';

    // Database
    try {
        await prisma.$queryRaw`SELECT 1`;
        components.database = { status: 'healthy' };
    } catch (err: any) {
        components.database = { status: 'unhealthy', message: 'Database unreachable' };
        overall = 'unhealthy';
    }

    // JWT
    if (env.jwtSecret) {
        components.jwt = { status: 'healthy' };
    } else {
        components.jwt = { status: 'degraded', message: 'JWT_SECRET not configured' };
        if (overall !== 'unhealthy') overall = 'degraded';
    }

    // Signing keys
    const hasPrivate = Boolean(env.ed25519PrivateKey);
    const hasPublic = Boolean(env.ed25519PublicKey || env.ed25519PublicKeys);
    if (hasPrivate && hasPublic) {
        components.signing = { status: 'healthy' };
    } else if (!hasPrivate && hasPublic) {
        components.signing = { status: 'degraded', message: 'Verification enabled but signing disabled (private key missing)' };
        if (overall !== 'unhealthy') overall = 'degraded';
    } else if (hasPrivate && !hasPublic) {
        components.signing = { status: 'degraded', message: 'Signing enabled but public key(s) missing for verification' };
        if (overall !== 'unhealthy') overall = 'degraded';
    } else {
        components.signing = { status: 'degraded', message: 'Signing and verification disabled' };
        if (overall !== 'unhealthy') overall = 'degraded';
    }

    // Billing webhook secret (optional)
    if (env.billingStripeWebhookSecret || env.billingWebhookSecret) {
        components.billingWebhook = { status: 'healthy' };
    } else {
        components.billingWebhook = { status: 'degraded', message: 'No billing webhook secret configured' };
        if (overall !== 'unhealthy') overall = 'degraded';
    }

    return res.status(overall === 'unhealthy' ? 503 : 200).json({ status: overall, components });
};
