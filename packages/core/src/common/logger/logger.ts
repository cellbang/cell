import { Logger as ILoger } from 'vscode-jsonrpc';
import * as log from 'loglevel';
import { Component, Value } from '../annotation';
import { Logger, LOGGER_CONFIG } from './logger-protocol';

export class ConsoleLogger implements ILoger {
    public error(message: string): void {
        console.error(message);
    }

    public warn(message: string): void {
        console.warn(message);
    }

    public info(message: string): void {
        console.info(message);
    }

    public log(message: string): void {
        console.log(message);
    }

    public debug(message: string): void {
        console.debug(message);
    }
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
