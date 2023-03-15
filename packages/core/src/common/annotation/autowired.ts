import { inject, multiInject } from 'inversify';
import { ContainerUtil } from '../container';
import { ComponentId } from './component';
import { AnnotationUtil } from '../utils';

export interface AutowiredOption {
    id?: ComponentId,
    multi?: boolean;
    detached?: boolean
}

export type IdOrAutowiredOption = ComponentId | AutowiredOption;

export type IdOrAutowiredOptionWithoutMulti = ComponentId | Omit<AutowiredOption, 'multi'>;

export const Autowired = function (idOrOption?: IdOrAutowiredOption): PropertyDecorator & ParameterDecorator {
    return (target: any, targetKey: string, index?: number) => {
        const option = parseAutowiredOption(target, targetKey, index, idOrOption);
        applyAutowiredDecorator(option, target, targetKey, index);
    };
};

export interface DoGetValue {
     (option: AutowiredOption, target: any, property: string): any;
}

export interface DoInject {
    (option: AutowiredOption, t: any, k: string, i?: number): any;
}

const defaultAutowiredOption: AutowiredOption = {
    multi: false,
    detached: false
};

export function parseAutowiredOption(target: any, targetKey: string, index?: number, idOrOption?: IdOrAutowiredOption, ) {
    const option = AnnotationUtil.getValueOrOption<AutowiredOption>(idOrOption);
    const type = AnnotationUtil.getType(target, targetKey, index);
    if (type === Array) {
        option.multi = true;
    }
    option.id = option.id || type;

    return { ...defaultAutowiredOption, ...option };
}

export function applyAutowiredDecorator(option: AutowiredOption, target: any, targetKey: string, index?: number,
    doInject: DoInject = ({ id, multi }, t: any, k, i) => multi ? multiInject(id!)(t, k, i) : inject(id!)(t, k, i),
    doGetValue: DoGetValue = ({ id, multi }, t, property) => multi ? ContainerUtil.getAll(id!) : ContainerUtil.get(id!)) {

    if (option.detached) {
        if (index !== undefined) {
            throw new Error(`The ${target.constructor.name} itself is not injected into the container, so the parameter injection of the constructor is not supported.`);
        }
        createAutowiredProperty(option, doGetValue, target, targetKey);
    } else {
        doInject(option, target, targetKey, index);

    }
    return option;
}

export function createAutowiredProperty(option: AutowiredOption, doGetValue: DoGetValue, target: any, property: string): void {
    let value: any;
    Object.defineProperty(target, property, {
        enumerable: true,
        get(): any {
            if (value !== undefined) {
                return value;
            }
            value = doGetValue(option, target, property);

            return value;
        }
    });
}
