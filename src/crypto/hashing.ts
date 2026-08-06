import argon2 from 'argon2';

export const constantTimeCompare = (a: string, b: string): boolean => {
    if (a.length !== b.length) {
        return false;
    }

    let result = 0;
    for (let i = 0; i < a.length; i += 1) {
        result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    return result === 0;
};

export const hashActivationKey = async (activationKey: string): Promise<string> => {
    return argon2.hash(activationKey, { type: argon2.argon2id });
};

export const verifyActivationKey = async (activationKey: string, storedHash: string): Promise<boolean> => {
    return argon2.verify(storedHash, activationKey);
};
