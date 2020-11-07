import { interfaces } from 'inversify';
import { fluentProvide } from 'inversify-binding-decorators';
import {applyComponentDecorator } from '@malagu/core';
import { PipeManager } from '@malagu/core';
import { ErrorConverter } from '../converter';
import { ConnectionHandler, NoOpConnectionHandler } from '../handler';
import { JsonRpcConnectionHandler } from '../factory';
import { RpcUtil } from '../utils';

export interface RpcOption {
    id: interfaces.ServiceIdentifier<any>
}
export namespace RpcOption {
    export function is(options: any): options is RpcOption {
        return options && (options.id !== undefined);
    }
}

export const Rpc = (idOrOption: interfaces.ServiceIdentifier<any> | RpcOption) => (target: any) => {
    const { id } = getRpcOption(idOrOption);
    applyComponentDecorator({ id, proxy: true }, target);
    fluentProvide(ConnectionHandler).inSingletonScope().onActivation(context => {
        const t = context.container.get(id);
        const pipeManager = context.container.get<PipeManager>(PipeManager);
        const errorConverters = [];
        try {
            const name = RpcUtil.toName(id);
            errorConverters.push(context.container.getNamed<ErrorConverter>(ErrorConverter, name));
        } catch (error) {
            if (!error?.message.startsWith('No matching bindings found for serviceIdentifier: Symbol(ErrorConverter)')) {
                throw error;
            }
        }
        return new JsonRpcConnectionHandler(RpcUtil.toPath(id), () => t, errorConverters, pipeManager);
    }).done(true)(NoOpConnectionHandler);
};

export function getRpcOption(idOrOption: interfaces.ServiceIdentifier<any> | RpcOption): RpcOption {

    if (RpcOption.is(idOrOption)) {
        return { ...idOrOption };
    }
    return { id: idOrOption };
}
