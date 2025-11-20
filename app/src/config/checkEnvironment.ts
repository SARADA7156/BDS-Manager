import { logger } from "../services/log/logger";

export function checkEnvironmentVariables(varNames: string[]): void {
    const missingVars: string[] = [];

    for (const varName of varNames) {
        if (!process.env[varName]) {
            missingVars.push(varName);
        }
    }

    if (missingVars.length > 0) {
        const errMessage = `環境変数が不足しているためサーバーを起動できません。 不足している環境変数: ${missingVars.join(', ')}`;
        logger.error(errMessage);
        process.exit(1);
    }
}