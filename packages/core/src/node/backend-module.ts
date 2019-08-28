import { ContainerModule } from 'inversify';
import { ConnnectionFactory, ConnnectionFactoryImpl } from '../common/jsonrpc/connection-factory';
import { DispatcherImpl, DefaultErrorHandler, ErrorHandlerProvider, ErrorHandler, Dispatcher } from './jsonrpc';
import { MiddlewareProvider } from './middleware';
import { ConfigProvider } from '../common/config-provider';
import { ConfigProviderImpl } from './config-provider';
import { ChannelManager } from './jsonrpc/channel-manager';
import { VALUE } from '../common/annotation/value';
import { BackendApplication } from './backend-application';
import { Application, ApplicationStateService, ApplicationLifecycle, EmptyApplicationLifecycle } from '../common/application-protocol';
import { BackendApplicationStateService } from './backend-application-state';
import { Logger, LOGGER_LEVEL } from '../common/logger';
import { LogLevelDesc, getLogger } from 'loglevel';

export const CoreBackendModule = new ContainerModule(bind => {
    bind(MiddlewareProvider).toSelf().inSingletonScope();
    bind(DefaultErrorHandler).toSelf().inSingletonScope();
    bind(ErrorHandler).toService(DefaultErrorHandler);
    bind(ErrorHandlerProvider).toSelf().inSingletonScope();
    bind(ChannelManager).toSelf().inSingletonScope();
    bind(ConfigProvider).to(ConfigProviderImpl).inSingletonScope();
    bind(Dispatcher).to(DispatcherImpl).inSingletonScope();
    bind(ConnnectionFactory).to(ConnnectionFactoryImpl).inSingletonScope();
    bind(BackendApplication).toSelf().inSingletonScope();
    bind(Application).toService(BackendApplication);
    bind(ApplicationStateService).to(BackendApplicationStateService).inSingletonScope();
    bind(ApplicationLifecycle).to(EmptyApplicationLifecycle).inSingletonScope();

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
