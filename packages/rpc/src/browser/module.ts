import '../common';
import { autoBind } from '@malagu/core';
import { ProxyProvider } from './jsonrpc';
import { ErrorConverter, RPC } from '../common';
export * from '.';

export default autoBind(bind => {

    bind(RPC).toDynamicValue(ctx => {
        const namedMetadata = ctx.currentRequest.target.getNamedTag();
        const path = namedMetadata!.value.toString();
        const proxyProvider = ctx.container.get<ProxyProvider>(ProxyProvider);
        const errorConverters = [];
        try {
            const id = ctx.currentRequest.serviceIdentifier;
            const name = typeof id !== 'function' ? <symbol | string>id : id.name || id.toString();
            errorConverters.push(ctx.container.getNamed<ErrorConverter>(ErrorConverter, name));
        } catch (error) {
            if (!error?.message.startsWith('No matching bindings found for serviceIdentifier: Symbol(ErrorConverter)')) {
                throw error;
            }
        }
        return proxyProvider.provide(path, errorConverters);
    });

});
