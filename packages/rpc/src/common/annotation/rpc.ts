import { interfaces } from 'inversify';
import { fluentProvide } from 'inversify-binding-decorators';
import { ConnectionHandler, NoOpConnectionHandler, JsonRpcConnectionHandler } from '../jsonrpc';
import {applyComponentDecorator } from '@malagu/core';

export const Rpc = (id: interfaces.ServiceIdentifier<any>) => (target: any) => {
    applyComponentDecorator({ id, proxy: true }, target);
    fluentProvide(ConnectionHandler).inSingletonScope().onActivation(context => {
        const t = context.container.get(id);
        return new JsonRpcConnectionHandler(id.toString(), () => t);
    }).done(true)(NoOpConnectionHandler);
};
