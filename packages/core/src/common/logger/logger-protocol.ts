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
    verbose(message: any, context?: string): void;
}

@Component(Logger)
export class LoggerImpl implements Logger {
    protected instance: Logger;

    constructor(
        @Value(LOGGER_CONFIG) protected readonly config: any
    ) {
        this.instance.error = log.error;
        this.instance.warn = log.warn;
        this.instance.info = log.info;
        this.instance.debug = log.debug;
        this.instance.verbose = log.trace;

        if (config.level) {
            log.setDefaultLevel(config.level);
        } else {
            log.setDefaultLevel('error');
        }
    }

    error(message: any, context = '') {
        return this.log('error', message, context);
    }

    info(message: any, context = '') {
        return this.log('info', message, context);
    }

    warn(message: any, context = '') {
        return this.log('warn', message, context);
    }

    debug(message: any, context = '') {
        return this.log('debug', message, context);
    }

    verbose(message: any, context = '') {
        return this.log('verbose', message, context);
    }

    protected log(logLevel: LogLevel, message: any, context: string) {
        this.instance[logLevel](message, context);
    }
}
