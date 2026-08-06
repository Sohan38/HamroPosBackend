import nacl from 'tweetnacl';

const decodeKey = (key: string): Uint8Array => {
    const normalized = key.trim();
    if (!normalized) {
        throw new Error('Ed25519 key material cannot be empty.');
    }

    if (/^[A-Fa-f0-9]+$/.test(normalized) && normalized.length % 2 === 0) {
        return new Uint8Array(Buffer.from(normalized, 'hex'));
    }

    return new Uint8Array(Buffer.from(normalized, 'base64'));
};

export const ed25519Sign = (payload: string, privateKey: string): string => {
    const key = decodeKey(privateKey);

    if (key.length !== 64) {
        throw new Error('Ed25519 private key must be 64 bytes long.');
    }

    const signature = nacl.sign.detached(new TextEncoder().encode(payload), key);
    return Buffer.from(signature).toString('base64');
};

export const ed25519Verify = (payload: string, signature: string, publicKey: string): boolean => {
    const key = decodeKey(publicKey);

    if (key.length !== 32) {
        throw new Error('Ed25519 public key must be 32 bytes long.');
    }

    const signatureBytes = new Uint8Array(Buffer.from(signature, 'base64'));
    return nacl.sign.detached.verify(new TextEncoder().encode(payload), signatureBytes, key);
};
