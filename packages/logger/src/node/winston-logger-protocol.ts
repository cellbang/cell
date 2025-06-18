import { Logger, LoggerOptions } from 'winston';

export const RawWinstonLogger = Symbol('WinstonLogger');

export const WinstonConfig = Symbol('WinstonConfig');

export interface WinstonConfig extends LoggerOptions {

}

export interface RawWinstonLogger extends Logger {

}
