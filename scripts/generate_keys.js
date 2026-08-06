const nacl = require('tweetnacl');
const { randomBytes } = require('crypto');

const kp = nacl.sign.keyPair();
const jwt = randomBytes(48).toString('hex');

const out = {
    jwtSecret: jwt,
    edPrivateBase64: Buffer.from(kp.secretKey).toString('base64'),
    edPublicBase64: Buffer.from(kp.publicKey).toString('base64'),
};

console.log(JSON.stringify(out));
