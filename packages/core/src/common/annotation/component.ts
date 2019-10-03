import { fluentProvide } from 'inversify-binding-decorators';
import { interfaces } from 'inversify';
import { METADATA_KEY } from '../constants';
import { ConnectionHandler, NoOpConnectionHandler } from '../jsonrpc/handler';
import { JsonRpcConnectionHandler } from '../jsonrpc/proxy-factory';
import { MethodBeforeAdvice, AfterReturningAdvice, AfterThrowsAdvice } from '../aop/aop-protocol';

export enum Scope {
    Request, Singleton, Transient
}
export interface ComponentOption {
    id?: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[];
    scope?: Scope;
    rebind?: boolean;
    rpc?: boolean;
    proxy?: boolean;
}
export namespace ComponentOption {
    export function is(options: any): options is ComponentOption {
        return options && (options.id !== undefined || options.scope !== undefined || options.rebind !== undefined || options.proxy !== undefined);
    }
}

export interface ComponentDecorator {
    (option?: interfaces.ServiceIdentifier<any> | ComponentOption): (target: any) => any;
}

export const Component =
    <ComponentDecorator>function (idOrOption?: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[] | ComponentOption): (target: any) => any {
    const option = getComponentOption(idOrOption);
    return (t: any) => {
        applyComponentDecorator(option, t);
    };
};

export function getComponentOption(idOrOption?: interfaces.ServiceIdentifier<any> | interfaces.ServiceIdentifier<any>[] | ComponentOption) {
    let option: ComponentOption = {};

    if (ComponentOption.is(idOrOption)) {
        option = { ...idOrOption };
    } else if (idOrOption) {
        option = { id: idOrOption };
    }
    return option;
}

function doProxy (context: interfaces.Context, t: any) {
    const proxy = new Proxy(t, {
        get: (target, method, receiver) => {
            const func = target[method];
            if (typeof func === 'function') {
                return async (...args: any[]) => {
                    try {
                        const beforeAdvices = context.container.getAll<MethodBeforeAdvice>(MethodBeforeAdvice) || [];
                        for (const advice of beforeAdvices) {
                            await advice.before(method, args, t);
                        }
                        const returnValue = await func.apply(target, args);
                        const afterReturningAdvices = context.container.getAll<AfterReturningAdvice>(AfterReturningAdvice) || [];
                        for (const advice of afterReturningAdvices) {
                            await advice.afterReturning(returnValue, method, args, t);
                        }
                        return returnValue;
                    } catch (error) {
                        const afterThrowsAdvices = context.container.getAll<AfterThrowsAdvice>(AfterThrowsAdvice) || [];
                        for (const advice of afterThrowsAdvices) {
                            await advice.afterThrows(error, method, args, t);
                        }
                        throw error;
                    }
                };
            }
            return func;
         }
    });
    proxy.target = t;
    t.proxyTarget = proxy;
    return proxy;
}

export function applyComponentDecorator(option: ComponentOption, target: any): void {
    const defaultComponentOption: ComponentOption = {
        id: target,
        scope: Scope.Singleton,
        rebind: false,
        rpc: false,
        proxy: false
    };
    const opt = { ...defaultComponentOption, ...option };
    const ids = Array.isArray(opt.id) ? opt.id : opt.id !== target ? [ opt.id, target ] : [ opt.id ] ;
    const id = <interfaces.ServiceIdentifier<any>>ids[0];
    const p = fluentProvide(id);
    let whenOn: any;
    if (opt.scope === Scope.Singleton) {
        whenOn = p.inSingletonScope();
    } else if (opt.scope === Scope.Transient) {
        whenOn = p.inTransientScope();
    }
    if (opt.proxy) {
        whenOn.onActivation(doProxy).done(true)(target);
    } else {
        whenOn.done(true)(target);
    }
    ids.shift();
    if (ids.length > 0) {
        (Reflect as any).defineMetadata(
            METADATA_KEY.toService,
            id,
            target
        );
    }
    for (const sevice of ids) {
        fluentProvide(<interfaces.ServiceIdentifier<any>>sevice).done(true)(target);
    }
    if (opt.rebind) {
        const metadata = true;
        (Reflect as any).defineMetadata(
            METADATA_KEY.rebind,
            metadata,
            target
        );
    }

    if (opt.rpc) {
        fluentProvide(ConnectionHandler).inSingletonScope().onActivation(context => {
            const t = context.container.get(id);
            return new JsonRpcConnectionHandler(id.toString(), () => t);
        }).done(true)(NoOpConnectionHandler);
    }
}
