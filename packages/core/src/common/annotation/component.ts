import { fluentProvide } from 'inversify-binding-decorators';
import { interfaces } from 'inversify';
import { METADATA_KEY } from '../constants';
import { ConnectionHandler } from '../jsonrpc/handler';
import { JsonRpcConnectionHandler } from '../jsonrpc/proxy-factory';

export enum Scope {
    Request, Singleton, Transient
}
export interface ComponentOption {
    id?: interfaces.ServiceIdentifier<any>,
    scope?: Scope,
    rebind?: boolean,
    rpc?: boolean
}
export namespace ComponentOption {
    export function is(options: any): options is ComponentOption {
        return options && (options.id !== undefined || options.scope !== undefined || options.rebind !== undefined);
    }
}

export interface ComponentDecorator {
    (option?: interfaces.ServiceIdentifier<any> | ComponentOption): (target: any) => any;
}

export const Component = <ComponentDecorator>function (idOrOption?: interfaces.ServiceIdentifier<any> | ComponentOption): (target: any) => any {
    const option = getComponentOption(idOrOption);
    return (t: any) => {
        applyComponentDecorator(option, t);
    };
};

export function getComponentOption(idOrOption?: interfaces.ServiceIdentifier<any> | ComponentOption) {
    let option: ComponentOption = {};

    if (ComponentOption.is(idOrOption)) {
        option = { ...idOrOption };
    } else if (idOrOption) {
        option = { id: idOrOption };
    }
    return option;
}

export function applyComponentDecorator(option: ComponentOption, target: any): void {
    const defaultComponentOption: ComponentOption = {
        id: target,
        scope: Scope.Singleton,
        rebind: false,
        rpc: false,
    };
    const opt = { ...defaultComponentOption, ...option };

    const id = <interfaces.ServiceIdentifier<any>>opt.id;
    const p = fluentProvide(id);
    if (opt.scope === Scope.Singleton) {
        p.inSingletonScope().done(true)(target);
    } else if (opt.scope === Scope.Transient) {
        p.inTransientScope().done(true)(target);
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
        fluentProvide(ConnectionHandler).inSingletonScope().onActivation((context, t) =>
            new JsonRpcConnectionHandler(id.toString(), proxy => t)
        ).done(true)(target);
    }
}
