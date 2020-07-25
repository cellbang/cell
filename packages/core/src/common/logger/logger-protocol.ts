export const LOGGER_CONFIG = 'malagu.logger';
export const Logger = Symbol('Logger');

export type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
    info(message: any, context?: string): void;
    error(message: any, context?: string): void;
    warn(message: any, context?: string): void;
    debug(message: any, context?: string): void;
}
