import { inject, interfaces, multiInject, Container } from 'inversify';
import { ServiceIdentifierOrFunc } from 'inversify/dts/annotation/inject';
import { ContainerProvider } from '../container';

export interface AutowiredOption {
    id?: ServiceIdentifierOrFunc,
    detached?: boolean
}
export namespace AutowiredOption {
    export function is(options: any): options is AutowiredOption {
        return options && (options.id !== undefined || options.detached !== undefined);
    }
}

export interface AutowiredDecorator {
    (option?: ServiceIdentifierOrFunc | AutowiredOption): (target: any, targetKey: string, index?: number) => any;
    (target: any, targetKey: string, index?: number): any;
}

export const Autowired = <AutowiredDecorator>function (target: any, targetKey: string, index?: number): any {
    const option = getAutowiredOption(target, targetKey, index);
    if (targetKey === undefined && index === undefined) {
        return (t: any, tk: string, i?: number) => {
            applyAutowiredDecorator(option, t, tk, i);
        };

    } else {
        applyAutowiredDecorator(option, target, targetKey, index);
    }
};

export function getAutowiredOption(target: any, targetKey: string, index?: number): AutowiredOption {
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

export function applyAutowiredDecorator(option: AutowiredOption, target: any, targetKey: string, index?: number,
    doInject = (id: ServiceIdentifierOrFunc, isMulti: boolean, t: any, k: string, i?: number) => {
        if (isMulti) {
            multiInject(<interfaces.ServiceIdentifier<any>>id)(t, k, i);
        } else {
            inject(id)(target, targetKey, index);
        }
    },
    doGetValue = (id: interfaces.ServiceIdentifier<any>, isMulti: boolean, container: Container, t: any, property: string) => {
        if (isMulti) {
            return container.getAll(id);
        } else {
            return container.get(id);
        }
    }): void {
    let type: any;
    if (index !== undefined)  {
        type = Reflect.getMetadata('design:paramtypes', target, targetKey)[index];

    } else {
        type = Reflect.getMetadata('design:type', target, targetKey);
    }
    const isMlt = type === Array;
    const defaultAutowiredOption: AutowiredOption = {
        id: type,
        detached: false
    };

    const opt = { ...defaultAutowiredOption, ...option };

    if (opt.detached) {
        if (index !== undefined) {
            throw new Error(`The ${target.constructor.name} itself is not injected into the container, so the parameter injection of the constructor is not supported.`);
        }
        createAutowiredProperty(opt, isMlt, doGetValue, target, targetKey);
        return;
    } else {
        doInject( <ServiceIdentifierOrFunc>opt.id, isMlt, target, targetKey, index);

    }
}

export function createAutowiredProperty(option: AutowiredOption, isMulti: boolean,
    doGetValue: (id: interfaces.ServiceIdentifier<any>, isMulti: boolean, container: Container, target: any, property: string) => any,
    target: any, property: string): void {
    let value: any;
    Object.defineProperty(target, property, {
        enumerable: true,
        get(): any {
            if (value !== undefined) {
                return value;
            }
            const container = ContainerProvider.provide();
            const id = <interfaces.ServiceIdentifier<any>>option.id;
            value = doGetValue(id, isMulti, container, target, property);

            return value;
        }
    });
}
