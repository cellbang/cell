import { fluentProvide } from 'inversify-binding-decorators';
import { interfaces } from 'inversify';
import { METADATA_KEY } from '../constants';
import { ConnectionHandler, JsonRpcConnectionHandler } from '../jsonrpc';
export interface ComponentOption {
    id?: interfaces.ServiceIdentifier<any>,
    singleton?: boolean,
    rebind?: boolean,
    rpc?: boolean
}
export namespace ComponentOption {
    export function is(options: any): options is ComponentOption {
        return options && (options.id !== undefined || options.singleton !== undefined || options.rebind !== undefined);
    }
}

export interface ComponentDecorator {
    (option?: interfaces.ServiceIdentifier<any> | ComponentOption): (target: any) => any;
}

export const component = <ComponentDecorator>function (idOrOption?: interfaces.ServiceIdentifier<any> | ComponentOption): (target: any) => any {
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
        singleton: true,
        rebind: false,
        rpc: false,
    };
    const opt = { ...defaultComponentOption, ...option };

    const id = <interfaces.ServiceIdentifier<any>>opt.id;
    const p = fluentProvide(id);
    if (opt.singleton) {
        p.inSingletonScope();
    }
    if (opt.rebind) {
        const metadata = true;
        (Reflect as any).defineMetadata(
            METADATA_KEY.rebind,
            metadata,
            target
        );
    }
    p.done(true)(target);

    if (opt.rpc) {
        fluentProvide(ConnectionHandler).inSingletonScope().onActivation((context, t) =>
            new JsonRpcConnectionHandler(id.toString(), proxy => t)
        ).done(true)(target);
    }
}
