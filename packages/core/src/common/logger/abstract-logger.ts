import { Autowired, Optional, Value } from '../annotation';
import { Emitter } from '../utils';
import { Logger, LOGGER_LEVEL, LogLevel, LogMessage, TraceIdProvider } from './logger-protocol';

export abstract class AbstractLogger implements Logger {
    protected readonly onLogEmitter = new Emitter<LogMessage>();
    readonly onLog = this.onLogEmitter.event;
    protected instance: Logger;
    protected context?: string;

    @Value(`${LOGGER_LEVEL} ?: 'info'`)
    level: LogLevel;

    @Autowired(TraceIdProvider) @Optional()
    protected readonly traceIdProvider?: TraceIdProvider;

    protected timeRecords: Map<string, number> = new Map();

    setContext(context?: string): void {
        this.context = context;
    }

    protected log(message: any, context?: string, logFn: (...args: any[]) => void = console.info): void {
        context = context ?? this.context;
        const time = new Date().toISOString();
        const traceId = this.traceIdProvider?.provide();
        const traceStr = traceId ? ` [trace: ${traceId}]` : '';
        const contextStr = this.context ? ` [${this.context}]` : '';
        logFn(`${time} [${this.level}]${traceStr}${contextStr} ${message}`);
        this.onLogEmitter.fire({
            level: this.level,
            traceId,
            context,
            message
        });
    }

    time(label: string): void {
        this.timeRecords.set(label, Date.now());
    }

    timeEnd(label: string, context?: string): number | undefined {
        const start = this.timeRecords.get(label);
        if (start !== undefined) {
            const duration = Date.now() - start;
            this.timeRecords.delete(label);
            this.log(`${label}: ${duration}ms`, context);
            return duration;
        } else {
            this.log(`No such label: ${label} for timeEnd`, context);
            return;
        }
    }

    abstract info(message: any, context?: string | undefined): void;
    abstract error(message: any, context?: string | undefined): void;
    abstract warn(message: any, context?: string | undefined): void;
    abstract debug(message: any, context?: string | undefined): void;
}
