import { autoBind } from '@malagu/core';
import { ProxyProvider } from './proxy';
import { ErrorConverter } from './converter';
import { ID_KEY, RPC } from './annotation';
import { RpcUtil } from './utils';
export * from '.';

export default autoBind(bind => {

    bind(RPC).toDynamicValue(ctx => {
        const id = ctx.currentRequest.target.getCustomTags()?.find(m => m.key === ID_KEY)!.value;
        const path = RpcUtil.toPath(id);
        const proxyProvider = ctx.container.get<ProxyProvider>(ProxyProvider);
        const errorConverters = [];
        try {
            const name = RpcUtil.toName(id);
            errorConverters.push(ctx.container.getNamed<ErrorConverter>(ErrorConverter, name));
        } catch (error) {
            if (!error?.message.startsWith('No matching bindings found for serviceIdentifier: Symbol(ErrorConverter)')) {
                throw error;
            }
        }
        return proxyProvider.provide(path, errorConverters);
    });

});
