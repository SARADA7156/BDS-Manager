import { logger } from "../services/log/logger";

export function checkEnvironmentVariables(varNames: string[]): void {
    const missingVars: string[] = [];

    for (const varName of varNames) {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    }

    if (missingVars.length > 0) {
        const errMessage = `Server setting Error. Missing environment variable: ${missingVars.join(', ')}`;
        logger.error(errMessage);
        process.exit(1);
    }
}