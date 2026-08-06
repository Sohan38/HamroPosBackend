import crypto from 'crypto';
import { securityConfig } from '../config/security';

export const formatActivationKey = (key: string): string => key.trim();

export const createActivationKeyLookupHash = (activationKey: string): string => {
    const normalized = formatActivationKey(activationKey);
    const hash = crypto
        .createHash('sha256')
        .update(`${normalized}${securityConfig.serverPepper}`)
        .digest('hex');
    return hash;
};
