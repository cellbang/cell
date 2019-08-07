import { ContainerModule } from 'inversify';
import { ConnnectionFactory, ConnnectionFactoryImpl } from '../common/jsonrpc/connection-factory';
import { DispatcherImpl, DefaultErrorHandler, ErrorHandlerProvider, ErrorHandler, Dispatcher } from './jsonrpc';
import { MiddlewareProvider } from './middleware';
import { ConfigProvider } from '../common/config-provider';
import { ConfigProviderImpl } from './config-provider';
import { ChannelManager } from './jsonrpc/channel-manager';

export const CoreBackendModule = new ContainerModule(bind => {
    bind(MiddlewareProvider).toSelf().inSingletonScope();
    bind(DefaultErrorHandler).toSelf().inSingletonScope();
    bind(ErrorHandler).toService(DefaultErrorHandler);
    bind(ErrorHandlerProvider).toSelf().inSingletonScope();
    bind(ChannelManager).toSelf().inSingletonScope();
    bind(ConfigProvider).to(ConfigProviderImpl).inSingletonScope();
    bind(Dispatcher).to(DispatcherImpl).inSingletonScope();
    bind(ConnnectionFactory).to(ConnnectionFactoryImpl).inSingletonScope();
});
