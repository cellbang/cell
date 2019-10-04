import { inject, named } from 'inversify';
import { ContainerProvider } from '../container';

export const VALUE = Symbol('Value');

export interface ValueOption {
    el?: string,
    detached?: boolean
}
export namespace ValueOption {
    export function is(option: any): option is ValueOption {
        return option && (option.el !== undefined || option.detached !== undefined);
    }
}

export interface ValueDecorator {
    (elOrValueOption?: string | ValueOption): (target: any, targetKey: string, index?: number) => any;
    (target: any, targetKey: string, index?: number): any;
}

export const Value = <ValueDecorator>function (target: any, targetKey: string, index?: number) {
    const option = getValueOption(target, targetKey, index);
    if (targetKey === undefined && index === undefined) {
        return (t: any, tk: string, i?: number) => {
            applyValueDecorator(option, t, tk, i);
        };

    } else {
        applyValueDecorator(option, target, targetKey, index);
    }
};

export function getValueOption(target: any, targetKey: string, index?: number) {
    let option: ValueOption = {};
    if (targetKey === undefined) {
        if (ValueOption.is(target)) {
            option = { ...target };
        } else if (target) {
            option = { el: target };
        }
    }
    return option;
}

export function applyValueDecorator(option: ValueOption, target: any, targetKey: string, index?: number): void {
    const defaultAutowiredOption: ValueOption = {
        el: targetKey,
        detached: false
    };
    const opt = { ...defaultAutowiredOption, ...option };
    if (opt.detached) {
        if (index !== undefined) {
            throw new Error(`The ${target.constructor.name} itself is not injected into the container, so the parameter injection of the constructor is not supported.`);
        }
        createValueProperty(opt, target, targetKey);
        return;
    }

    const el = <string>opt.el;
    inject(VALUE)(target, targetKey, index);
    named(el)(target, targetKey, index);
}

export function createValueProperty(option: ValueOption, target: any, property: string) {
    Object.defineProperty(target, property, {
        enumerable: true,
        get() {
            const container = ContainerProvider.provide();
            const el = <string>option.el;
            return container.getNamed(VALUE, el);
        }
    });
}
