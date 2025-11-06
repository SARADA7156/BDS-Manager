import winston, { format } from 'winston';

const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

const customFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `[${timestamp} ${level.toUpperCase()}] ${message}`;
});

export const logger = winston.createLogger({
    level: LOG_LEVEL,
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        customFormat,
        winston.format.colorize(),
        format.errors({ stack: true }),
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/latest.log' })
    ]
});