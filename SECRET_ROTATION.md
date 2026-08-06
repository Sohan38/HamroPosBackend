Secret rotation and runtime guard recommendations

- Rotate signing keys (Ed25519) regularly and support multiple public keys in `ED25519_PUBLIC_KEYS`.
  - Use a key-id (kid) in metadata if you implement JWT-like headers in signed payloads.
  - Keep previous public keys available until all clients have rotated.

- Private key handling
  - Store `ED25519_PRIVATE_KEY` in a secret manager (Vault, Secrets Manager, Neon/Platform secrets).
  - Do not commit private keys to repo or environment files.

- Runtime guards
  - Application should refuse to perform sensitive operations when private keys or JWT secrets are missing.
  - Use health checks that report degraded status when critical secrets absent.

- Rollout plan for rotating keys
  1. Add new key pair; push new public key to `ED25519_PUBLIC_KEYS` alongside existing keys.
  2. Deploy service reading both keys. Start signing with new private key while verifying against both public keys.
  3. Wait for clients to accept the new key (monitor logs + metrics).
  4. Remove the old public key after a safe window.

- Emergency revocation
  - If a private key is compromised, rotate immediately and revoke the old key.
  - Use short-lived activation tokens or reissue activation in extreme cases.

- Testing
  - Test key rotation using a staging environment and verify backwards compatibility.
