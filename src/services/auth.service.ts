import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface TokenPayload {
    sub: string;
    role: string;
}

export class AuthService {
    signToken(subject: string, role: string, expiresIn?: string | jwt.SignOptions['expiresIn']) {
        const payload: TokenPayload = { sub: subject, role };
        const secret = env.jwtSecret;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        const rawExpiresIn = expiresIn ?? env.jwtExpiresIn;
        const calculatedExpiresIn = rawExpiresIn as jwt.SignOptions['expiresIn'];
        const options: jwt.SignOptions = { expiresIn: calculatedExpiresIn };
        return jwt.sign(payload, secret, options);
    }

    verifyToken<T = any>(token: string): T {
        const secret = env.jwtSecret;
        if (!secret) {
            throw new Error('JWT_SECRET not configured');
        }
        return jwt.verify(token, secret) as T;
    }
}
