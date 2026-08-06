import { createActivationKeyLookupHash, formatActivationKey } from '../crypto/activationKey';
import { hashActivationKey, verifyActivationKey, constantTimeCompare } from '../crypto/hashing';
import { ed25519Sign, ed25519Verify } from '../crypto/ed25519';
import { securityConfig } from '../config/security';

export class CryptoService {
    formatActivationKey(key: string): string {
        return formatActivationKey(key);
    }

    createLookupHash(key: string): string {
        return createActivationKeyLookupHash(key);
    }

    hashKey(key: string): Promise<string> {
        return hashActivationKey(key);
    }

    verifyKey(key: string, hash: string): Promise<boolean> {
        return verifyActivationKey(key, hash);
    }

    constantTimeCompare(a: string, b: string): boolean {
        return constantTimeCompare(a, b);
    }

    signPayload(payload: string): string {
        if (!securityConfig.ed25519PrivateKey || securityConfig.ed25519PrivateKey.trim() === '') {
            throw new Error('Signing disabled: ED25519 private key not configured.');
        }
        return ed25519Sign(payload, securityConfig.ed25519PrivateKey);
    }

    verifySignature(payload: string, signature: string): boolean {
        const keys: string[] = [];
        if (securityConfig.ed25519PublicKey && securityConfig.ed25519PublicKey.trim() !== '') keys.push(securityConfig.ed25519PublicKey);
        if (securityConfig.ed25519PublicKeys.length > 0) {
            keys.push(...securityConfig.ed25519PublicKeys);
        }

        if (keys.length === 0) return false;

        for (const k of keys) {
            try {
                if (ed25519Verify(payload, signature, k)) return true;
            } catch (err) {
                // ignore malformed key and try next
                continue;
            }
        }

        return false;
    }

    isSigningEnabled(): boolean {
        return !!(securityConfig.ed25519PrivateKey && securityConfig.ed25519PrivateKey.trim() !== '');
    }

    getPublicKeys(): string[] {
        const keys: string[] = [];
        if (securityConfig.ed25519PublicKey && securityConfig.ed25519PublicKey.trim() !== '') keys.push(securityConfig.ed25519PublicKey);
        if (securityConfig.ed25519PublicKeys.length > 0) {
            keys.push(...securityConfig.ed25519PublicKeys);
        }
        return keys;
    }
}
