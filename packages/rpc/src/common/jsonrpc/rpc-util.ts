import { interfaces } from 'inversify';
import { ContainerUtil } from '@malagu/core';
import { RPC } from '../annotation';

export namespace RpcUtil {
    export function get<T>(rpcServiceIdentifier: interfaces.ServiceIdentifier<T>): T {
        return ContainerUtil.getNamed(RPC, rpcServiceIdentifier.toString());
    }
}
