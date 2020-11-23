import { interfaces } from 'inversify';
import { ContainerUtil } from '@malagu/core';
import { ID_KEY, RPC } from '../annotation';

export namespace RpcUtil {
    export function get<T>(rpcServiceIdentifier: interfaces.ServiceIdentifier<T>): T {
        return ContainerUtil.getTagged(RPC, ID_KEY, rpcServiceIdentifier);
    }

    export function toPath(serviceIdentifier: any) {
        return typeof serviceIdentifier !== 'function' ? serviceIdentifier.toString() : serviceIdentifier.name || serviceIdentifier.toString();

    }

    export function toName(serviceIdentifier: any) {
        return typeof serviceIdentifier !== 'function' ? <symbol | string>serviceIdentifier : serviceIdentifier.name || serviceIdentifier.toString();

    }
}
