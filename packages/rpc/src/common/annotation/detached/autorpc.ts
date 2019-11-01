import { applyAutowiredDecorator, getAutowiredOption, AutowiredDecorator } from '@malagu/core';
import { inject, named, Container, interfaces } from 'inversify';
import { ServiceIdentifierOrFunc } from 'inversify/dts/annotation/inject';
import { RPC } from '../autorpc';

export const Autorpc = <AutowiredDecorator>function (target: any, targetKey: string, index?: number) {
    const option = getAutowiredOption(target, targetKey, index);
    option.detached = true;
    const doInject = (id: ServiceIdentifierOrFunc, isMulti: boolean, t: any, k: string, i?: number) => {
        inject(RPC)(t, k, i);
        named(id.toString())(t, k, i);
    };
    const doGetValue = (id: interfaces.ServiceIdentifier<any>, isMulti: boolean, container: Container, t: any, property: string) => container.getNamed(RPC, id.toString());

    if (targetKey === undefined) {
        return (t: any, tk: string, i?: number) => {
            applyAutowiredDecorator(option, t, tk, i, doInject, doGetValue);
        };

    } else {
        applyAutowiredDecorator(option, target, targetKey, index, doInject, doGetValue);
    }
};
