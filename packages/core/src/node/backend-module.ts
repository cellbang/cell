export * from '../common';
import { VALUE } from '../common/annotation/value';
import { Logger, LOGGER_LEVEL } from '../common/logger';
import { LogLevelDesc, getLogger } from 'loglevel';
import 'reflect-metadata';
import { autoBind } from '../common/auto-bind';
import { ConfigProvider } from '../common/config-provider';
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
