import { AutowiredDecorator, getAutowiredOption, applyAutowiredDecorator } from '@malagu/core';
import { inject, named } from 'inversify';
import { ServiceIdentifierOrFunc } from 'inversify/dts/annotation/inject';

export const RPC = Symbol('RPC');

export const Autorpc = <AutowiredDecorator>function (target: any, targetKey: string, index?: number) {
    const option = getAutowiredOption(target, targetKey, index);
    const doInject = (id: ServiceIdentifierOrFunc, isMulti: boolean, t: any, k: string, i?: number) => {
        inject(RPC)(t, k, i);
        named(id.toString())(t, k, i);
    };

    if (targetKey === undefined) {
        return (t: any, tk: string, i?: number) => {
            applyAutowiredDecorator(option, t, tk, i, doInject);
        };

    } else {
        applyAutowiredDecorator(option, target, targetKey, index, doInject);
    }
};
