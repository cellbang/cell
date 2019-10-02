export * from '../common';
import { RPC } from '../common/annotation/autowired';
import { Logger, LOGGER_LEVEL } from '../common/logger';
import { LogLevelDesc, getLogger } from 'loglevel';
import { VALUE } from '../common/annotation/value';
import { autoBind } from '../common/auto-bind';
import { ProxyProvider } from './jsonrpc/proxy-protocol';
import { ConfigProvider } from '../common/config';
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
