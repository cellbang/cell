import { Logger as ILoger } from 'vscode-jsonrpc';
import * as log from 'loglevel';

export const LOGGER_LEVEL = 'logger.level';
export const Logger = Symbol('Logger');

export interface Logger extends log.Logger {
}
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
