import * as log from 'loglevel';
import { Component, Value } from '../annotation';

export const LOGGER_CONFIG = 'malagu.logger';
export const Logger = Symbol('Logger');

export type LogLevel = 'verbose' | 'debug' | 'info' | 'warn' | 'error';

export interface Logger {
    info(message: any, context?: string): void;
    error(message: any, context?: string): void;
    warn(message: any, context?: string): void;
    debug(message: any, context?: string): void;
}

@Component(Logger)
export class LoggerImpl implements Logger {
    protected instance: Logger;

    constructor(
        @Value(LOGGER_CONFIG) protected readonly config: any
    ) {
        if (config.level) {
            log.setLevel(config.level);
        } else {
            log.setLevel('error');
        }
    }

    error(message: any, context = ''): void {
        log.error(message, context);
    }

    info(message: any, context = ''): void {
        log.info(message, context);
    }

    warn(message: any, context = ''): void {
        log.warn(message, context);
    }

    debug(message: any, context = ''): void {
        log.debug(message, context);
    }

}
