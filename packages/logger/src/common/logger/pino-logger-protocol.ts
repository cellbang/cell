import * as pino from 'pino';

export const PinoConfig = Symbol('PinoConfig');
export const PinoDestinationConfig = Symbol('PinoDestinationConfig');

export interface PinoConfig extends pino.LoggerOptions {

};

export interface PinoDestinationConfig extends pino.DestinationStream {

}
