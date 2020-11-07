import { applyAutowiredDecorator, getAutowiredOption, AutowiredDecorator, ContainerUtil } from '@malagu/core';
import { inject, tagged, interfaces } from 'inversify';
import { ServiceIdentifierOrFunc } from 'inversify/dts/annotation/inject';
import { RPC, ID_KEY } from '../autorpc';

export const Autorpc = <AutowiredDecorator>function (target: any, targetKey: string, index?: number) {
    const option = getAutowiredOption(target, targetKey, index);
    option.detached = true;
    const doInject = (id: ServiceIdentifierOrFunc, isMulti: boolean, t: any, k: string, i?: number) => {
        inject(RPC)(t, k, i);
        tagged(ID_KEY, id)(t, k, i);
    };
    const doGetValue = (id: interfaces.ServiceIdentifier<any>, isMulti: boolean, t: any, property: string) => ContainerUtil.getTagged(RPC, ID_KEY, id);

    if (targetKey === undefined) {
        return (t: any, tk: string, i?: number) => {
            applyAutowiredDecorator(option, t, tk, i, doInject, doGetValue);
        };

    } else {
        applyAutowiredDecorator(option, target, targetKey, index, doInject, doGetValue);
    }
};
