import { interfaces } from 'inversify';
import { applyAutowiredDecorator, DoInject, parseAutowiredOption, IdOrAutowiredOptionWithoutMulti } from './autowired';
import { Inject } from './inject';
import { Tagged } from './tagged';
import { ProviderCreator } from '../provider/provider-protocol';
import { ComponentId } from './component';

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

export function bindAutowiredProvider(bind: interfaces.Bind): any {
    bind(PROVIDER).toDynamicValue(ctx => {
        const id = ctx.currentRequest.target.getCustomTags()?.find(m => m.key === ID_KEY)!.value as ComponentId;
        const providerCreator = ctx.container.get<ProviderCreator<any>>(ProviderCreator);

        return providerCreator.create(id, ctx.container);
    });
}

