import { Injectable } from '../annotation';
import { Logger, LogLevel, LogMessage } from '../logger/logger-protocol';
import { Emitter } from '../utils';

@Injectable()
export class MockLogger implements Logger {
    level: LogLevel = 'info';
    protected readonly onLogEmitter = new Emitter<LogMessage>();
    onLog = this.onLogEmitter.event;
    time(label: string): void {
        // do nothing
    }
    timeEnd(label: string, context?: string): number | undefined {
        return undefined;
    }
    setContext(context?: string): void {
        // do nothing
    }
    info(message: any, context?: string): void {
        // do nothing
    }
    error(message: any, context?: string): void {
        // do nothing
    }
    warn(message: any, context?: string): void {
        // do nothing
    }
    debug(message: any, context?: string): void {
        // do nothing
    }
}
