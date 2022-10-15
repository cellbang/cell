import { ComponentDecorator, applyComponentDecorator, ComponentOption, parseComponentOption, Logger } from '@malagu/core';
import { AOP_POINTCUT, PipeManager } from '@malagu/web';
import { ConnectionHandler } from '../handler';
import { JsonRpcConnectionHandler } from '../factory';
import { RpcUtil, ConverterUtil } from '../utils';

export const RPC_TAG = 'Rpc';

export const Rpc = <ComponentDecorator>function (...idOrOption: any): ClassDecorator {
    return target => {
        const option = parseRpcOption(target, idOrOption);
        applyRpcDecorator(option, target);
    };
};

export function parseRpcOption(target: any, idOrOption: any) {
    const parsed = parseComponentOption(target, idOrOption);

    if (idOrOption[0].proxy === undefined) {
        parsed.proxy = true;
    }
    parsed.sysTags!.push(AOP_POINTCUT, RPC_TAG);
    return parsed;
}

export function applyRpcDecorator(option: ComponentOption, target: any) {
    const { ids } = applyComponentDecorator(option, target);
    const id = ids[1] || ids[0];
    return applyComponentDecorator({ id: ConnectionHandler, onActivation: context => {
        const t = context.container.get(id);
        const pipeManager = context.container.get<PipeManager>(PipeManager);
        const logger = context.container.get<Logger>(Logger);
        const errorConverters = ConverterUtil.getGlobalErrorConverters(context.container);
        const errorConverter = ConverterUtil.getErrorConverters(id, context.container);
        if (errorConverter) {
            errorConverters.push(errorConverter);
        }
        return new JsonRpcConnectionHandler(RpcUtil.toPath(id), () => t, errorConverters, pipeManager, logger);
    }}, target);
}

