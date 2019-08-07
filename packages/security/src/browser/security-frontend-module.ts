import { ContainerModule } from 'inversify';
import { UserServer, userPath, AuthServer, authPath } from '../common';
import { ProxyProvider } from '@malagu/core/lib/browser';

export default new ContainerModule(bind => {

    bind(UserServer).toDynamicValue(ctx => {
        const provider = ctx.container.get<ProxyProvider>(ProxyProvider);
        return provider.provide<UserServer>(userPath);
    }).inSingletonScope();

    bind(AuthServer).toDynamicValue(ctx => {
        const provider = ctx.container.get<ProxyProvider>(ProxyProvider);
        return provider.provide<AuthServer>(authPath);
    }).inSingletonScope();

});
