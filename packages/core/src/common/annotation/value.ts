import { inject, named } from 'inversify';
import { ConfigUtil } from '../config/config-util';
import { AnnotationUtil } from '../utils';

export const VALUE = Symbol('Value');

export interface ValueOption {
    el?: string,
    detached?: boolean
}

export type ElOrValueOption = string | ValueOption;

export const Value = function (elOrOption?: ElOrValueOption): PropertyDecorator & ParameterDecorator {
    return (target: any, targetKey: string, index?: number) => {
        const option = parseValueOption(target, targetKey, index, elOrOption);
        applyValueDecorator(option, target, targetKey, index);
    };
};

const defaultValueOption: ValueOption = {
    detached: false
};

export function parseValueOption(target: any, targetKey: string, index?: number, elOrOption?: ElOrValueOption) {
    const option = AnnotationUtil.getValueOrOption<ValueOption>(elOrOption, 'el');
    option.el = option.el || targetKey;
    return { ...defaultValueOption, ...option };
}

export function applyValueDecorator(option: ValueOption, target: any, targetKey: string, index?: number) {
    if (option.detached) {
        if (index !== undefined) {
            throw new Error(`The ${target.constructor.name} itself is not injected into the container, so the parameter injection of the constructor is not supported.`);
        }
        createValueProperty(option, target, targetKey);
        return;
    }

    const el = option.el!;
    inject(VALUE)(target, targetKey, index);
    named(el)(target, targetKey, index);
    return option;
}

export function createValueProperty(option: ValueOption, target: any, property: string): void {
    Object.defineProperty(target, property, {
        enumerable: true,
        get(): any {
            const el = option.el!;
            return ConfigUtil.get(el);
        }
    });
}
