import { ContainerModule } from 'inversify';
import { ProxyProvider, ProxyCreator } from './jsonrpc/proxy-protocol';
import { ConnnectionFactory, ConnnectionFactoryImpl } from '../common/jsonrpc/connection-factory';
import { ConfigProvider } from '../common/config-provider';
import { ConfigProviderImpl } from './config-provider';
import { RPC } from '../common/annotation/autowired';
import { ProxyProviderImpl, HttpProxyCreator, WebSocketProxyCreator } from './jsonrpc';
import { Logger, LOGGER_LEVEL } from '../common/logger';
import { LogLevelDesc, getLogger } from 'loglevel';
import { ApplicationShell, ApplicationShellImpl } from './application-shell';
import { FrontendApplication, FrontendApplicationLifecycle, EmptyFrontendApplicationLifecycle } from './frontend-application';
import { FrontendApplicationStateService } from './frontend-application-state';
import { VALUE } from '../common/annotation/value';

export const CoreFrontendModule = new ContainerModule(bind => {
    bind(ProxyProvider).to(ProxyProviderImpl).inSingletonScope();
    bind(HttpProxyCreator).toSelf().inSingletonScope();
    bind(ProxyCreator).toService(HttpProxyCreator);
    bind(WebSocketProxyCreator).toSelf().inSingletonScope();
    bind(ProxyCreator).toService(WebSocketProxyCreator);
    bind(ConnnectionFactory).to(ConnnectionFactoryImpl).inSingletonScope();
    bind(ConfigProvider).to(ConfigProviderImpl).inSingletonScope();
    bind(ApplicationShell).to(ApplicationShellImpl).inSingletonScope();
    bind(FrontendApplication).toSelf().inSingletonScope();
    bind(FrontendApplicationStateService).toSelf().inSingletonScope();
    bind(FrontendApplicationLifecycle).to(EmptyFrontendApplicationLifecycle).inSingletonScope();
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
