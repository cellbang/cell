export * from '../common';
import { LogLevelDesc, getLogger } from 'loglevel';
import { autoBind, ConfigProvider, VALUE, Logger, LOGGER_LEVEL, RPC } from '../common';
import { ProxyProvider } from './jsonrpc';
export * from '.';

export const CoreFrontendModule = autoBind(bind => {
    bind(Logger).toDynamicValue(ctx => {
        const configProvider = ctx.container.get<ConfigProvider>(ConfigProvider);
        const level = configProvider.get<LogLevelDesc>(LOGGER_LEVEL, 'ERROR');
        const logger = getLogger('FrontendApplicationLogger');
        logger.setDefaultLevel(level);
        return logger;
    }).inSingletonScope();

    bind(RPC).toDynamicValue(ctx => {
        const namedMetadata = ctx.currentRequest.target.getNamedTag();
        const path = namedMetadata!.value.toString();
        const proxyProvider = ctx.container.get<ProxyProvider>(ProxyProvider);
        return proxyProvider.provide(path);
    });

    bind(VALUE).toDynamicValue(ctx => {
        const namedMetadata = ctx.currentRequest.target.getNamedTag();
        const el = namedMetadata!.value.toString();
        const configProvider = ctx.container.get<ConfigProvider>(ConfigProvider);
        return configProvider.get(el);
    });

});
