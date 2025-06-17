import { Component } from '../annotation';
import { Scope } from '../container';
import { AbstractLogger } from './abstract-logger';
import { Logger } from './logger-protocol';

@Component({ id: Logger, scope: Scope.Transient })
export class LoggerImpl extends AbstractLogger {

    error(message: any, context?: string): void {
        this.log(message, context, console.error.bind(console));
    }

    info(message: any, context?: string): void {
        if (['info', 'debug'].includes(this.level)) {
            this.log(message, context);
        }
    }

    warn(message: any, context?: string): void {
        if (['info', 'debug', 'warn'].includes(this.level)) {
            this.log(message, context, console.warn.bind(console));
        }
    }

    debug(message: any, context?: string): void {
        if (this.level === 'debug') {
            this.log(message, context, console.debug.bind(console));
        }
    }

}
