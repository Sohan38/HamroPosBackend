import { z } from 'zod';

export const licenseActivationSchema = z.object({
    body: z.object({
        activationKey: z.string().min(1),
        deviceId: z.string().uuid(),
        deviceMeta: z.object({
            platform: z.string().min(1),
            manufacturer: z.string().optional(),
            model: z.string().optional(),
            appVersion: z.string().min(1),
        }),
    }),
});

export const licenseVerifySchema = z.object({
    body: z.object({
        licenseId: z.string().min(1),
        deviceId: z.string().uuid(),
    }),
});

export const licenseResetSchema = z.object({
    body: z.object({
        activationKey: z.string().min(1),
        deviceId: z.string().uuid(),
    }),
});
