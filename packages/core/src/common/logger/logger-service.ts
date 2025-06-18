import { Component } from '../annotation';
import { LoggerService, onLogEmitter } from './logger-protocol';

@Component(LoggerService)
export class LoggerServiceImpl implements LoggerService {
    readonly onLog = onLogEmitter.event;
}
