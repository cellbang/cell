import { applyAutowiredDecorator, IdOrAutowiredOption, DoInject, parseAutowiredOption } from '@malagu/core';
import { inject, tagged } from 'inversify';

export const RPC = Symbol('RPC');
export const ID_KEY = Symbol('ID_KEY');

export const Autorpc = function (idOrOption?: IdOrAutowiredOption): PropertyDecorator & ParameterDecorator {
    return (target: any, targetKey: string, index?: number) => {
        const option = parseAutowiredOption(target, targetKey, index, idOrOption);
        applyAutowiredDecorator(option, target, targetKey, index, doInjectForAutorpc);
    };
};

export const doInjectForAutorpc: DoInject = (option, t, k, i) => {
    inject(RPC)(t, k, i);
    tagged(ID_KEY, option.id!)(t, k, i);
};

