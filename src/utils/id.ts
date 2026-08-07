import { randomUUID } from 'crypto';

export function generateId(prefix?: string) {
    const uuid = randomUUID();
    if (!prefix) return uuid;

    const slug = prefix
        .toString()
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    return slug ? `${slug}-${uuid}` : uuid;
}
