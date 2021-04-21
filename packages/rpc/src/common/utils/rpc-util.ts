import { interfaces } from 'inversify';
import { ContainerUtil } from '@malagu/core';
import { ID_KEY, RPC } from '../annotation';
import { HttpProxyCreator, HttpProxyCreatorOptions, MergeOptions } from '../proxy/http-proxy-creator';
import urlJoin = require('url-join');
import { ProxyCreator } from '../proxy/proxy-protocol';

let defaultProxyCreator: ProxyCreator | undefined;

export namespace RpcUtil {
    export function get<T extends object>(rpcServiceIdentifier: interfaces.ServiceIdentifier<T>): T {
        if (defaultProxyCreator) {
            return defaultProxyCreator.create<T>(toPath(rpcServiceIdentifier));
        }
        return ContainerUtil.getTagged(RPC, ID_KEY, rpcServiceIdentifier);
    }

    export function getDefaultProxyCreator(endpoint: string, options?: Partial<HttpProxyCreatorOptions<Partial<MergeOptions>>>) {
        return defaultProxyCreator;
    }

    export function setDefaultProxyCreator(endpoint: string, options?: Partial<HttpProxyCreatorOptions<Partial<MergeOptions>>>) {
        defaultProxyCreator = createProxyCreator(endpoint, options);
    }

    export function createProxyCreator(endpoint: string, options?: Partial<HttpProxyCreatorOptions<Partial<MergeOptions>>>) {
        return new HttpProxyCreator({ ...options, endpointResolver: {
            resolve(serviceIdentifier: string) {
                return Promise.resolve(urlJoin(endpoint, serviceIdentifier));
            }
        }});
    }

    export function create<T extends object>(endpoint: string, rpcServiceIdentifier: interfaces.ServiceIdentifier<T>,
        options?: Partial<HttpProxyCreatorOptions<Partial<MergeOptions>>>): T {
        return createProxyCreator(endpoint, options).create<T>(toPath(rpcServiceIdentifier));
    }

    export function toPath(serviceIdentifier: any) {
        return typeof serviceIdentifier !== 'function' ? serviceIdentifier.toString() : serviceIdentifier.name || serviceIdentifier.toString();

    }

    export function toName(serviceIdentifier: any) {
        return typeof serviceIdentifier !== 'function' ? <symbol | string>serviceIdentifier : serviceIdentifier.name || serviceIdentifier.toString();

    }
}
