import '../common';
import { autoBind } from '@malagu/core';
import { ProxyProvider } from './jsonrpc';
import { RPC } from '../common';
export * from '.';

export default autoBind(bind => {

    bind(RPC).toDynamicValue(ctx => {
        const namedMetadata = ctx.currentRequest.target.getNamedTag();
        const path = namedMetadata!.value.toString();
        const proxyProvider = ctx.container.get<ProxyProvider>(ProxyProvider);
        return proxyProvider.provide(path);
    });

});
