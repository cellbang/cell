import * as log from 'loglevel';

export const LOGGER_LEVEL = 'malagu.logger.level';
export const Logger = Symbol('Logger');

export interface Logger extends log.Logger {
}
