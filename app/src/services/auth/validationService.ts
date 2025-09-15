import validator from 'validator';

export class ValidationService {
    // Emailアドレスを検証
    public isValidEmail(email: string): boolean {
        return validator.isEmail(email);
    }
}