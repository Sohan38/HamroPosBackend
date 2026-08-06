import { describe, it, expect, beforeEach } from 'vitest';
import { CryptoService } from '../services/crypto.service';
import { securityConfig } from '../config/security';

describe('CryptoService', () => {
    const svc = new CryptoService();

    beforeEach(() => {
        // reset any keys
        securityConfig.ed25519PrivateKey = '';
        securityConfig.ed25519PublicKey = '';
    });

    it('isSigningEnabled is false when private key missing', () => {
        expect(svc.isSigningEnabled()).toBe(false);
    });

    it('signPayload throws when private key missing', () => {
        expect(() => svc.signPayload('payload')).toThrow('Signing disabled');
    });

    it('verifySignature returns false when public key missing', () => {
        expect(svc.verifySignature('p', 's')).toBe(false);
    });
});
