import { Autowired, Optional, Value } from '../annotation';
import { Logger, LOGGER_LEVEL, LogLevel, TraceIdProvider } from './logger-protocol';

export abstract class AbstractLogger implements Logger {
    protected instance: Logger;
    protected context?: string;

    @Value(`${LOGGER_LEVEL} ?: 'info'`)
    protected level: LogLevel;

    @Autowired(TraceIdProvider) @Optional()
    protected readonly traceIdProvider?: TraceIdProvider;

    setContext(context?: string): void {
        this.context = context;
    }

    protected call(logFn: (...args: any[]) => void, message: any, context?: string): void {
        context = context ?? this.context;
        const time = new Date().toISOString();
        const traceId = this.traceIdProvider?.provide();
        const traceStr = traceId ? ` [trace: ${traceId}]` : '';
        const contextStr = this.context ? ` [${this.context}]` : '';
        logFn(`${time} [${this.level}]${traceStr}${contextStr} ${message}`);
    }

    abstract info(message: any, context?: string | undefined): void;
    abstract error(message: any, context?: string | undefined): void;
    abstract warn(message: any, context?: string | undefined): void;
    abstract debug(message: any, context?: string | undefined): void;

}
