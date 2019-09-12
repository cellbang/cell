import { inject, named, interfaces, multiInject } from 'inversify';
import { ServiceIdentifierOrFunc } from 'inversify/dts/annotation/inject';
import { ContainerProvider } from '../container-provider';

export interface AutowiredOption {
    id?: ServiceIdentifierOrFunc,
    rpc?: boolean,
    detached?: boolean
}
export namespace AutowiredOption {
    export function is(options: any): options is AutowiredOption {
        return options && (options.id !== undefined || options.rpc !== undefined || options.detached !== undefined);
    }
}

export interface AutowiredDecorator {
    (option?: ServiceIdentifierOrFunc | AutowiredOption): (target: any, targetKey: string, index?: number) => any;
    (target: any, targetKey: string, index?: number): any;
}

export const RPC = Symbol('RPC');
export const Autowired = <AutowiredDecorator>function (target: any, targetKey: string, index?: number) {
    const option = getAutowiredOption(target, targetKey, index);
    if (targetKey === undefined && index === undefined) {
        return (t: any, tk: string, i?: number) => {
            applyAutowiredDecorator(option, t, tk, i);
        };

    } else {
        applyAutowiredDecorator(option, target, targetKey, index);
    }
};

export function getAutowiredOption(target: any, targetKey: string, index?: number) {
    let option: AutowiredOption = {};
    if (targetKey === undefined) {
        if (AutowiredOption.is(target)) {
            option = { ...target };
        } else if (target) {
            option = { id: target };
        }
    }
    return option;
}

export function applyAutowiredDecorator(option: AutowiredOption, target: any, targetKey: string, index?: number): void {
    let type: any;
    if (index !== undefined)  {
        type = Reflect.getMetadata('design:paramtypes', target, targetKey)[index];

    } else {
        type = Reflect.getMetadata('design:type', target, targetKey);
    }
    const isMulti = type === Array;
    const defaultAutowiredOption: AutowiredOption = {
        id: type,
        rpc: false,
        detached: false
    };
    const opt = { ...defaultAutowiredOption, ...option };
    if (opt.detached) {
        if (index !== undefined) {
            throw new Error(`The ${target.constructor.name} itself is not injected into the container, so the parameter injection of the constructor is not supported.`);
        }
        createAutowiredProperty(opt, isMulti, target, targetKey);
        return;
    }

    const id = <ServiceIdentifierOrFunc>opt.id;
    if (opt.rpc) {
        inject(RPC)(target, targetKey, index);
        named(id.toString())(target, targetKey, index);
    } else {
        if (isMulti) {
            multiInject(<interfaces.ServiceIdentifier<any>>id)(target, targetKey, index);
        } else {
            inject(id)(target, targetKey, index);
        }
    }
}

export function createAutowiredProperty(option: AutowiredOption, isMulti: boolean, target: any, property: string) {
    let value: any;
    Object.defineProperty(target, property, {
        enumerable: true,
        get() {
            if (value !== undefined) {
                return value;
            }
            const container = ContainerProvider.provide();
            const id = <interfaces.ServiceIdentifier<any>>option.id;
            if (option.rpc) {
                value = container.getNamed(RPC, id.toString());
            } else {
                if (isMulti) {
                    value = container.getAll(id);
                } else {
                    value = container.get(id);
                }
            }

            return value;
        }
    });
}
