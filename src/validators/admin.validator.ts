import { z } from 'zod';

export const createFeatureSchema = z.object({
    body: z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        valueType: z.enum(['boolean', 'numeric']),
        description: z.string().optional(),
    }),
});

export const planIdParamSchema = z.object({
    params: z.object({
        planId: z.string().min(1),
    }),
});

export const licenseIdParamSchema = z.object({
    params: z.object({
        licenseId: z.string().min(1),
    }),
});

export const planEntitlementsSchema = z.object({
    params: z.object({
        planId: z.string().min(1),
    }),
    body: z.object({
        entitlements: z.array(
            z.object({
                featureId: z.string().min(1),
                valueType: z.enum(['boolean', 'numeric']),
                booleanValue: z.boolean().optional(),
                numericValue: z.number().optional(),
            }),
        ),
    }),
});

export const licenseEntitlementsSchema = z.object({
    params: z.object({
        licenseId: z.string().min(1),
    }),
    body: z.object({
        overrides: z.array(
            z.object({
                featureId: z.string().min(1),
                valueType: z.enum(['boolean', 'numeric']),
                booleanValue: z.boolean().optional(),
                numericValue: z.number().optional(),
            }),
        ),
    }),
});

export const createLicenseSchema = z.object({
    body: z.object({
        id: z.string().optional(),
        subscriptionId: z.string().min(1),
        status: z.enum(['active', 'trial', 'expired', 'suspended']).optional(),
        maxDevicesOverride: z.number().int().min(1).optional(),
        overrides: z.array(
            z.object({
                featureId: z.string().min(1),
                valueType: z.enum(['boolean', 'numeric']),
                booleanValue: z.boolean().optional(),
                numericValue: z.number().optional(),
            }),
        ).optional(),
    }),
});

export const createTokenSchema = z.object({
    body: z.object({
        email: z.string().email().optional(),
        password: z.string().optional(),
        expiresIn: z.string().optional(),
    }),
});

export const setupAdminSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        role: z.string().optional(),
    }),
});

export const adminCreateSchema = z.object({
    body: z.object({
        email: z.string().email(),
        password: z.string().min(8),
        role: z.enum(['superadmin', 'admin']).optional(),
    }),
});

export const adminUpdateSchema = z.object({
    params: z.object({ id: z.string().min(1) }),
    body: z.object({
        email: z.string().email().optional(),
        role: z.enum(['superadmin', 'admin']).optional(),
        disabled: z.boolean().optional(),
    }),
});

export const adminListSchema = z.object({
    query: z.object({
        page: z.string().optional(),
        perPage: z.string().optional(),
        q: z.string().optional(),
        sort: z.string().optional(),
    }),
});

export const adminAuditQuerySchema = z.object({
    query: z.object({
        adminId: z.string().optional(),
        action: z.string().optional(),
        from: z.string().optional(),
        to: z.string().optional(),
        page: z.string().optional(),
        perPage: z.string().optional(),
    }),
});