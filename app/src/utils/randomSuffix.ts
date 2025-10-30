import crypto from 'crypto';

export function generateRandomSuffix(length: number = 8): string {
    return crypto.randomBytes(length).toString('hex');
}