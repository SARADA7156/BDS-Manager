import { z } from 'zod';

export function isEmail(email: string): boolean {
    const schema = z.email();
    const result = schema.safeParse(email);

    return result.success ? true : false;
}