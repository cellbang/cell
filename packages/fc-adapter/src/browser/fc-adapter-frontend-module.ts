import { ContainerModule } from 'inversify';
import { FCProxyCreator } from './fc-proxy-creator';
import { ProxyCreator } from '@malagu/core/lib/browser';

export default new ContainerModule(bind => {
    bind(FCProxyCreator).toSelf().inSingletonScope();
    bind(ProxyCreator).toService(FCProxyCreator);
});
