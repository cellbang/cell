import { autoBind } from '@celljs/core';
import { ProxyProvider } from './proxy';
import { ID_KEY, RPC } from './annotation';
import { RpcUtil, ConverterUtil } from './utils';
import './index';

export default autoBind(bind => {

    bind(RPC).toDynamicValue(ctx => {
        const id = ctx.currentRequest.target.getCustomTags()?.find(m => m.key === ID_KEY)!.value;
        const path = RpcUtil.toPath(id);
        const proxyProvider = ctx.container.get<ProxyProvider>(ProxyProvider);
        const errorConverters = ConverterUtil.getGlobalErrorConverters(ctx.container);
        const errorConverter = ConverterUtil.getErrorConverters(id, ctx.container);
        if (errorConverter) {
            errorConverters.push(errorConverter);
        }
        return proxyProvider.provide(path, errorConverters);
    });

});
