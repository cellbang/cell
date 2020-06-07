import * as pino from 'pino';

export const PinoConfig = Symbol('PinoConfig');

export interface PinoConfig extends pino.LoggerOptions {

};
