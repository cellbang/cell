export * from '../common';
import { LogLevelDesc, getLogger } from 'loglevel';
import 'reflect-metadata';
import { autoBind, ConfigProvider, Logger, LOGGER_LEVEL, VALUE } from '../common';
export * from '.';

export const CoreBackendModule = autoBind(bind => {
    bind(Logger).toDynamicValue(ctx => {
        const configProvider = ctx.container.get<ConfigProvider>(ConfigProvider);
        const level = configProvider.get<LogLevelDesc>(LOGGER_LEVEL, 'ERROR');
        const logger = getLogger('FrontendApplicationLogger');
        logger.setDefaultLevel(level);
        return logger;
    }).inSingletonScope();

    bind(VALUE).toDynamicValue(ctx => {
        const namedMetadata = ctx.currentRequest.target.getNamedTag();
        const el = namedMetadata!.value.toString();
        const configProvider = ctx.container.get<ConfigProvider>(ConfigProvider);
        return configProvider.get(el);
    });
});
