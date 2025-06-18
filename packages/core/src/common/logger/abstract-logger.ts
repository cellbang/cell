import { Autowired, Optional, Value } from '../annotation';
import { Logger, LOGGER_LEVEL, LogLevel, onLogEmitter, TraceIdProvider } from './logger-protocol';

export abstract class AbstractLogger implements Logger {
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

    protected resolveContextString(context?: string): string {
        if (this.context) {
            return context ? `[${this.context}] [${context}] ` : `[${this.context}] `;
        }
        return context ? `[${context}] ` : '';
    }

    protected resolvePrefix(): string {
        const time = new Date().toISOString();
        return `${time} [${this.level}]`;
    }

    protected log(message: any, context?: string, logFn: (...args: any[]) => void = console.info): void {
        context = context ?? this.context;
        const traceId = this.traceIdProvider?.provide();
        const traceStr = traceId ? ` [trace: ${traceId}]` : '';
        const contextStr = this.resolveContextString(context);
        logFn(`${this.resolvePrefix()}${traceStr}${contextStr} ${message}`);
        onLogEmitter.fire({
            level: this.level,
            traceId,
            rootContext: this.context,
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
            this.log(`${label} [${duration}ms]`, context);
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
