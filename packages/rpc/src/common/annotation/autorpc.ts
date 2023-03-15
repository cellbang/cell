import { applyAutowiredDecorator, IdOrAutowiredOptionWithoutMulti, DoInject, parseAutowiredOption, Tagged, Inject } from '@malagu/core';

export const RPC = Symbol('RPC');
export const ID_KEY = Symbol('ID_KEY');

export const Autorpc = function (idOrOption?: IdOrAutowiredOptionWithoutMulti): PropertyDecorator & ParameterDecorator {
    return (target: any, targetKey: string, index?: number) => {
        const option = parseAutowiredOption(target, targetKey, index, idOrOption);
        applyAutowiredDecorator(option, target, targetKey, index, doInjectForAutorpc);
    };
};

export const doInjectForAutorpc: DoInject = (option, t, k, i) => {
    Inject(RPC)(t, k, i);
    Tagged(ID_KEY, option.id!)(t, k, i);
};

