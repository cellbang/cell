import { Logger, LOGGER_CONFIG, Value, Component, Autowired, Optional, AbstractLogger, PostConstruct, Scope } from '@celljs/core';
import { WinstonConfig, RawWinstonLogger } from './winston-logger-protocol';
import { createLogger, transports, format } from 'winston';

@Component({ id: Logger, rebind: true, scope: Scope.Transient })
export class WinstonLogger extends AbstractLogger {

    @Value(`${LOGGER_CONFIG}.winstonConfig`)
    protected readonly winstonConfig?: WinstonConfig;

    @Autowired(WinstonConfig)
    @Optional()
    protected readonly winstonConfig2?: WinstonConfig;

    @Autowired(RawWinstonLogger)
    @Optional()
    protected logger: RawWinstonLogger;

    @PostConstruct()
    protected init() {
        if (!this.logger) {
            this.logger = createLogger({
                level: this.level,
                format: format.combine(
                    format.timestamp(),
                    format.printf(({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`)
                ),
                transports: [new transports.Console()],
                ...this.winstonConfig,
                ...this.winstonConfig2,
            });
        }
    }

    getLogger() {
        return this.logger;
    }

    error(message: string, context?: string) {
        this.log(message, context, this.logger.error.bind(this.logger));
    }

    warn(message: string, context?: string) {
        this.log(message, context, this.logger.warn.bind(this.logger));
    }

    info(message: string, context?: string) {
        this.log(message, context, this.logger.info.bind(this.logger));
    }

    debug(message: string, context?: string) {
        this.log(message, context, this.logger.debug.bind(this.logger));
    }

    protected override log(message: any, context?: string, logFn?: (...args: any[]) => void): void {
        super.log(message, context, logFn ?? this.logger.info.bind(this.logger));
    }
}
