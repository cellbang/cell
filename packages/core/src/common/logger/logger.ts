import { Component } from '../annotation';
import { Scope } from '../container';
import { AbstractLogger } from './abstract-logger';
import { Logger } from './logger-protocol';

@Component({ id: Logger, scope: Scope.Transient })
export class LoggerImpl extends AbstractLogger {

    error(message: any, context?: string): void {
        this.call(console.error.bind(console), message, context);
    }

    info(message: any, context?: string): void {
        if (['info', 'debug'].includes(this.level)) {
            this.call(console.info.bind(console), message, context);
        }
    }

    warn(message: any, context?: string): void {
        if (['info', 'debug', 'warn'].includes(this.level)) {
            this.call(console.warn.bind(console), message, context);
        }
    }

    debug(message: any, context?: string): void {
        if (this.level === 'debug') {
            this.call(console.debug.bind(console), message, context);
        }
    }

}
