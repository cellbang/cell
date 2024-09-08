import { Injectable } from '../annotation';
import { Logger } from '../logger/logger-protocol';

@Injectable()
export class MockLogger implements Logger {
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
