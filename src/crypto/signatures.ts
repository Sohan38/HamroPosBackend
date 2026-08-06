const canonicalize = (value: unknown): unknown => {
    if (value instanceof Date) {
        return value.toISOString();
    }

    if (Array.isArray(value)) {
        return value.map(canonicalize);
    }

    if (value && typeof value === 'object') {
        return Object.keys(value as Record<string, unknown>)
            .sort()
            .reduce((acc, key) => {
                const typedAcc = acc as Record<string, unknown>;
                typedAcc[key] = canonicalize((value as Record<string, unknown>)[key]);
                return typedAcc;
            }, {} as Record<string, unknown>);
    }

    return value;
};

export const createSignaturePayload = (payload: Record<string, unknown>): string => {
    return JSON.stringify(canonicalize(payload));
};
