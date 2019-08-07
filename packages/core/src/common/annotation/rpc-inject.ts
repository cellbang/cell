import { inject, named }from 'inversify';

export const RPC = Symbol('RPC');
export function rpcInject(serviceIdentifier: any, path?: string) {
    return function (target: any, targetKey: string, index?: number): void {
        inject(RPC)(target, targetKey, index);
        named(path || serviceIdentifier)(target, targetKey, index);
    };
}
