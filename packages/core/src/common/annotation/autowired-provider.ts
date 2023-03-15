import { applyAutowiredDecorator, DoInject, parseAutowiredOption, IdOrAutowiredOptionWithoutMulti } from './autowired';
import { Inject } from './inject';
import { Tagged } from './tagged';

export const PROVIDER = Symbol('PROVIDER');
export const ID_KEY = Symbol('ID_KEY');

export const AutowiredProvider = function (idOrOption?: IdOrAutowiredOptionWithoutMulti): PropertyDecorator & ParameterDecorator {
    return (target: any, targetKey: string, index?: number) => {
        const option = parseAutowiredOption(target, targetKey, index, idOrOption);
        applyAutowiredDecorator(option, target, targetKey, index, doInjectForAutowiredProvider);
    };
};

export const doInjectForAutowiredProvider: DoInject = (option, t, k, i) => {
    Inject(PROVIDER)(t, k, i);
    Tagged(ID_KEY, option.id!)(t, k, i);
};

