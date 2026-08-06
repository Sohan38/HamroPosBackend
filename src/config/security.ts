import { env } from './env';

export const securityConfig = {
    serverPepper: env.serverPepper,
    ed25519PrivateKey: env.ed25519PrivateKey,
    // Single legacy public key (kept for backwards compat)
    ed25519PublicKey: env.ed25519PublicKey,
    // Parsed list of public keys for rotation support
    ed25519PublicKeys: (env.ed25519PublicKeys || '')
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean),
};
