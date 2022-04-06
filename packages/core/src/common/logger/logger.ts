import * as log from 'loglevel';
import { Component, Value } from '../annotation';
import { Logger, LOGGER_CONFIG } from './logger-protocol';

@Component(Logger)
export class LoggerImpl implements Logger {
    protected instance: Logger;

    constructor(
        @Value(LOGGER_CONFIG) protected readonly config: any
    ) {
        if (config?.level) {
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
